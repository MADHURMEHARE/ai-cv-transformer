const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CV = require('../models/CV');
const { processFile } = require('../services/fileProcessor');
const { transformCVWithAI } = require('../services/aiService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and Excel files are allowed.'), false);
    }
  }
});

// Upload and process CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    
    // Create CV record
    const cv = new CV({
      originalFileName: req.file.originalname,
      originalFileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      originalFilePath: req.file.path,
      fileSize: req.file.size,
      sessionId: req.body.sessionId || 'anonymous',
      status: 'uploaded'
    });

    await cv.save();

    // Process file asynchronously
    processFileAsync(cv._id, req.file.path, req.file.originalname);

    res.json({
      success: true,
      cvId: cv._id,
      message: 'File uploaded successfully. Processing started.',
      status: 'uploaded'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
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
    console.error('Get CV error:', error);
    res.status(500).json({ error: 'Failed to retrieve CV' });
  }
});

// Get all CVs for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const cvs = await CV.find({ sessionId: req.params.sessionId })
      .sort({ uploadedAt: -1 })
      .select('originalFileName status uploadedAt transformedData.header.name');
    res.json(cvs);
  } catch (error) {
    console.error('Get session CVs error:', error);
    res.status(500).json({ error: 'Failed to retrieve CVs' });
  }
});

// Update CV data
router.put('/:id', async (req, res) => {
  try {
    const { transformedData } = req.body;
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    cv.transformedData = { ...cv.transformedData, ...transformedData };
    cv.lastModified = new Date();
    await cv.save();

    res.json({ success: true, cv });
  } catch (error) {
    console.error('Update CV error:', error);
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
    if (fs.existsSync(cv.originalFilePath)) {
      fs.unlinkSync(cv.originalFilePath);
    }

    // Delete exported files
    cv.exportedFiles.forEach(exportFile => {
      if (fs.existsSync(exportFile.filePath)) {
        fs.unlinkSync(exportFile.filePath);
      }
    });

    await CV.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});

// Export CV
router.post('/:id/export', async (req, res) => {
  try {
    const { format } = req.body;
    const cv = await CV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    if (cv.status !== 'completed') {
      return res.status(400).json({ error: 'CV processing not completed' });
    }

    // Generate export file
    const exportPath = await generateExport(cv, format);
    
    // Add export record
    await cv.addExport(format, exportPath);

    res.json({
      success: true,
      downloadUrl: `/api/cv/download/${path.basename(exportPath)}`,
      message: 'Export generated successfully'
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export CV' });
  }
});

// Download exported file
router.get('/download/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../exports', req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Async file processing function
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

    // Update status to processing
    console.log('Updating CV status to processing...');
    await cv.updateStatus('processing');

    // Extract text from file
    console.log('Extracting text from file...');
    const extractedText = await processFile(filePath, originalName);
    console.log(`Text extraction completed. Length: ${extractedText.length}`);
    console.log('Text preview:', extractedText.substring(0, 200) + '...');
    
    // Update CV with extracted text
    cv.extractedText = extractedText;
    await cv.save();
    console.log('CV updated with extracted text');

    // Transform with AI
    console.log('Starting AI transformation...');
    const transformedData = await transformCVWithAI(extractedText);
    console.log('AI transformation completed successfully');
    console.log('Transformed data structure:', Object.keys(transformedData));
    
    // Update CV with transformed data
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

// Generate export file (placeholder - implement based on format)
async function generateExport(cv, format) {
  // This would generate the actual export file
  // For now, return a placeholder path
  const exportDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  const filename = `${cv.transformedData.header.name || 'cv'}-${Date.now()}.${format}`;
  const exportPath = path.join(exportDir, filename);
  
  // Create a simple export file (implement proper formatting)
  const content = JSON.stringify(cv.transformedData, null, 2);
  fs.writeFileSync(exportPath, content);
  
  return exportPath;
}

module.exports = router;