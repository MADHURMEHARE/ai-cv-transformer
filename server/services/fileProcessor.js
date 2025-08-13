const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

/**
 * Process different file types and extract text content
 * @param {string} filePath - Path to the uploaded file
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} - Extracted text content
 */
async function processFile(filePath, originalName) {
  try {
    const fileExtension = path.extname(originalName).toLowerCase();
    const fileBuffer = fs.readFileSync(filePath);

    switch (fileExtension) {
      case '.pdf':
        return await processPDF(fileBuffer);
      case '.docx':
        return await processDOCX(fileBuffer);
      case '.xlsx':
      case '.xls':
        return await processExcel(fileBuffer);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

/**
 * Process PDF files and extract text
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function processPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    // Clean up extracted text
    let cleanedText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

/**
 * Process DOCX files and extract text
 * @param {Buffer} fileBuffer - DOCX file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function processDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in DOCX');
    }

    // Clean up extracted text
    let cleanedText = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('DOCX processing error:', error);
    throw new Error(`DOCX processing failed: ${error.message}`);
  }
}

/**
 * Process Excel files and extract text
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function processExcel(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    let extractedText = '';
    
    // Process each sheet
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert sheet data to text
      for (const row of jsonData) {
        if (Array.isArray(row)) {
          const rowText = row
            .filter(cell => cell !== null && cell !== undefined)
            .map(cell => String(cell).trim())
            .filter(cell => cell.length > 0)
            .join(' | ');
          
          if (rowText.length > 0) {
            extractedText += rowText + '\n';
          }
        }
      }
      
      if (sheetNames.length > 1) {
        extractedText += `\n--- ${sheetName} ---\n\n`;
      }
    }

    if (!extractedText.trim()) {
      throw new Error('No text content found in Excel file');
    }

    // Clean up extracted text
    let cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Excel processing error:', error);
    throw new Error(`Excel processing failed: ${error.message}`);
  }
}

/**
 * Validate file content and structure
 * @param {string} text - Extracted text content
 * @returns {Object} - Validation result
 */
function validateContent(text) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: []
  };

  if (!text || text.trim().length === 0) {
    validation.isValid = false;
    validation.errors.push('No content found in file');
    return validation;
  }

  if (text.length < 50) {
    validation.warnings.push('File content seems too short for a CV');
  }

  if (text.length > 50000) {
    validation.warnings.push('File content is very long, processing may take time');
  }

  // Check for common CV indicators
  const cvKeywords = [
    'experience', 'education', 'skills', 'work', 'job', 'position',
    'company', 'university', 'degree', 'responsibilities', 'achievements'
  ];

  const foundKeywords = cvKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length < 3) {
    validation.warnings.push('Content may not be a CV (few CV-related keywords found)');
  }

  return validation;
}

/**
 * Extract basic information from text content
 * @param {string} text - Raw text content
 * @returns {Object} - Basic extracted information
 */
function extractBasicInfo(text) {
  const info = {
    name: null,
    email: null,
    phone: null,
    hasExperience: false,
    hasEducation: false,
    hasSkills: false
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    info.email = emails[0];
  }

  // Extract phone numbers
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    info.phone = phones[0];
  }

  // Check for common sections
  const lowerText = text.toLowerCase();
  info.hasExperience = lowerText.includes('experience') || lowerText.includes('work history');
  info.hasEducation = lowerText.includes('education') || lowerText.includes('academic');
  info.hasSkills = lowerText.includes('skills') || lowerText.includes('competencies');

  return info;
}

module.exports = {
  processFile,
  validateContent,
  extractBasicInfo
};