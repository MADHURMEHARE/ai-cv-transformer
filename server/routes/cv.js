const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const CV = require('../models/cv');
const { processFile } = require('../services/fileProcessor');
const { transformCVWithAI } = require('../services/aiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and Excel files are allowed.'));
    }
  }
});

// Get all CVs
router.get('/', async (req, res) => {
  try {
    const cvs = await CV.find().sort({ uploadedAt: -1 });
    res.json(cvs);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

// Get CV by ID
router.get('/:id', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cv);
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ error: 'Failed to fetch CV' });
  }
});

// Upload new CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File upload received:', req.file.originalname);
    
    const cv = new CV({
      originalName: req.file.originalname,
      originalFileType: path.extname(req.file.originalname).toLowerCase(),
      filePath: req.file.path,
      status: 'uploaded',
      uploadedAt: new Date()
    });

    const savedCV = await cv.save();
    console.log('CV saved to database:', savedCV._id);

    // Start processing in background
    processFileAsync(savedCV._id, req.file.path, req.file.originalname);

    res.status(201).json(savedCV);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Update CV
router.put('/:id', async (req, res) => {
  try {
    const { transformedData } = req.body;
    
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    cv.transformedData = transformedData;
    const updatedCV = await cv.save();

    res.json(updatedCV);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update CV' });
  }
});

// Delete CV
router.delete('/:id', async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(cv.filePath);
    } catch (fileError) {
      console.warn('File not found for deletion:', fileError.message);
    }

    await CV.findByIdAndDelete(req.params.id);
    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});

// Export CV as PDF with EHS formatting
router.post('/export', async (req, res) => {
  try {
    const { cvId, format, ehsStandards } = req.body;
    
    if (!cvId) {
      return res.status(400).json({ error: 'CV ID is required' });
    }

    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    if (!cv.transformedData) {
      return res.status(400).json({ error: 'CV has not been processed yet' });
    }

    if (format === 'pdf') {
      // Generate EHS-formatted PDF
      const pdfBuffer = await generateEHSPDF(cv.transformedData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.transformedData.header.name || 'CV'} (EHS Formatted).pdf"`);
      res.send(pdfBuffer);
    } else {
      res.status(400).json({ error: 'Unsupported format. Only PDF is supported.' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export CV' });
  }
});

// Generate EHS-formatted PDF
async function generateEHSPDF(transformedData) {
  // For now, we'll create a simple HTML representation that can be converted to PDF
  // In a production environment, you'd use a proper PDF library like PDFKit or Puppeteer
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>EHS Formatted CV</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Palatino+Linotype:wght@400;700&display=swap');
        
        body {
          font-family: 'Palatino Linotype', Palatino, serif;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .name {
          font-size: 36px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .title {
          font-size: 24px;
          color: #374151;
          margin-bottom: 20px;
        }
        
        .photo-placeholder {
          width: 4.7cm;
          height: 4.7cm;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          color: #6b7280;
          font-size: 12px;
          text-align: center;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #6b7280;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 2px solid #dbeafe;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        
        .personal-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .detail-label {
          font-weight: bold;
          color: #374151;
          min-width: 120px;
        }
        
        .profile {
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .experience-item {
          margin-bottom: 25px;
          padding-left: 20px;
          border-left: 3px solid #dbeafe;
        }
        
        .company {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .position {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 5px;
        }
        
        .duration {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 10px;
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
        }
        
        .responsibilities {
          list-style: none;
          padding-left: 0;
        }
        
        .responsibilities li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          line-height: 1.6;
        }
        
        .responsibilities li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #2563eb;
          font-weight: bold;
        }
        
        .education-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .education-info h4 {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 5px 0;
        }
        
        .education-info p {
          margin: 0;
          color: #6b7280;
        }
        
        .education-year {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .skills-container, .interests-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .skill-tag, .interest-tag {
          background: linear-gradient(135deg, #dbeafe, #e0e7ff);
          color: #1e40af;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #bfdbfe;
        }
        
        .ehs-notice {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 8px;
          border: 2px solid #0ea5e9;
        }
        
        .ehs-notice h3 {
          color: #0c4a6e;
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        
        .ehs-standards {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #0c4a6e;
        }
        
        .standard-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .standard-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${transformedData.header.name || 'Professional Name'}</div>
        <div class="title">${transformedData.header.jobTitle || 'Professional Title'}</div>
        ${transformedData.header.photoUrl ? 
          `<img src="${transformedData.header.photoUrl}" alt="Professional Photo" style="width: 4.7cm; height: 4.7cm; object-fit: cover; border-radius: 8px;">` :
          `<div class="photo-placeholder">Professional Photo<br/>4.7cm × 4.7cm</div>`
        }
        <div class="contact-info">
          ${transformedData.personalDetails.contactInfo.email ? `<span>📧 ${transformedData.personalDetails.contactInfo.email}</span>` : ''}
          ${transformedData.personalDetails.contactInfo.phone ? `<span>📱 ${transformedData.personalDetails.contactInfo.phone}</span>` : ''}
          ${transformedData.personalDetails.contactInfo.address ? `<span>📍 ${transformedData.personalDetails.contactInfo.address}</span>` : ''}
        </div>
      </div>

      ${(transformedData.personalDetails.nationality || transformedData.personalDetails.languages.length > 0 || transformedData.personalDetails.dateOfBirth || transformedData.personalDetails.maritalStatus) ? `
        <div class="section">
          <div class="section-title">Personal Details</div>
          <div class="personal-details">
            ${transformedData.personalDetails.nationality ? `<div class="detail-item"><span class="detail-label">Nationality:</span> <span>${transformedData.personalDetails.nationality}</span></div>` : ''}
            ${transformedData.personalDetails.languages.length > 0 ? `<div class="detail-item"><span class="detail-label">Languages:</span> <span>${transformedData.personalDetails.languages.join(', ')}</span></div>` : ''}
            ${transformedData.personalDetails.dateOfBirth ? `<div class="detail-item"><span class="detail-label">Date of Birth:</span> <span>${transformedData.personalDetails.dateOfBirth}</span></div>` : ''}
            ${transformedData.personalDetails.maritalStatus ? `<div class="detail-item"><span class="detail-label">Marital Status:</span> <span>${transformedData.personalDetails.maritalStatus}</span></div>` : ''}
          </div>
        </div>
      ` : ''}

      ${transformedData.profile ? `
        <div class="section">
          <div class="section-title">Professional Profile</div>
          <div class="profile">${transformedData.profile}</div>
        </div>
      ` : ''}

      ${transformedData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${transformedData.experience.map(exp => `
            <div class="experience-item">
              <div class="company">${exp.company}</div>
              <div class="position">${exp.position}</div>
              <div class="duration">${exp.duration}</div>
              ${exp.responsibilities.length > 0 ? `
                <ul class="responsibilities">
                  ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${transformedData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${transformedData.education.map(edu => `
            <div class="education-item">
              <div class="education-info">
                <h4>${edu.degree} in ${edu.field}</h4>
                <p>${edu.institution}</p>
              </div>
              <div class="education-year">${edu.year}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${transformedData.keySkills.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Skills</div>
          <div class="skills-container">
            ${transformedData.keySkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${transformedData.interests.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Interests</div>
          <div class="interests-container">
            ${transformedData.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="ehs-notice">
        <h3>✓ EHS Formatting Standards Applied</h3>
        <div class="ehs-standards">
          <div class="standard-item">
            <div class="standard-dot"></div>
            <span>Palatino Linotype Font</span>
          </div>
          <div class="standard-item">
            <div class="standard-dot"></div>
            <span>Professional Layout</span>
          </div>
          <div class="standard-item">
            <div class="standard-dot"></div>
            <span>EHS Standards</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // For now, return the HTML content
  // In production, you would convert this to PDF using a library like Puppeteer
  return Buffer.from(htmlContent, 'utf8');
}

// Background processing function
async function processFileAsync(cvId, filePath, originalName) {
  try {
    console.log(`Starting file processing for CV ID: ${cvId}`);
    console.log(`File path: ${filePath}`);
    console.log(`Original name: ${originalName}`);
    
    const cv = await CV.findById(cvId);
    if (!cv) {
      console.error(`CV not found for ID: ${cvId}`);
      return;
    }
    console.log('Updating CV status to processing...');
    await cv.updateStatus('processing');

    console.log('Extracting text from file...');
    const extractedText = await processFile(filePath, originalName);
    console.log(`Text extraction completed. Length: ${extractedText.length}`);
    console.log('Text preview:', extractedText.substring(0, 200) + '...');
    
    cv.extractedText = extractedText;
    await cv.save();
    console.log('CV updated with extracted text');

    console.log('Starting AI transformation...');
    const transformedData = await transformCVWithAI(extractedText);
    console.log('AI transformation completed successfully');
    console.log('Transformed data structure:', Object.keys(transformedData));
    
    cv.transformedData = transformedData;
    cv.status = 'completed';
    cv.processedAt = new Date();
    cv.processingDuration = Date.now() - new Date(cv.uploadedAt).getTime();
    await cv.save();
    console.log('CV processing completed successfully');

  } catch (error) {
    console.error('Processing error:', error);
    console.error('Error stack:', error.stack);
    
    const cv = await CV.findById(cvId);
    if (cv) {
      console.log('Updating CV status to error');
      await cv.updateStatus('error', { errors: [error.message] });
    }
  }
}

module.exports = router;