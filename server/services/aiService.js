const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

// Debug logging
console.log('AI Service Initialization:');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not set');
console.log('Google API Key:', process.env.GOOGLE_API_KEY ? 'Set' : 'Not set');
console.log('OpenAI Client:', openai ? 'Initialized' : 'Not initialized');
console.log('Anthropic Client:', anthropic ? 'Initialized' : 'Not initialized');
console.log('Google Client:', genAI ? 'Initialized' : 'Not initialized');

/**
 * Transform CV content using AI with multiple model fallback
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformCVWithAI(text, preferences = {}) {
  console.log('transformCVWithAI called with text length:', text.length);
  console.log('Text preview:', text.substring(0, 200) + '...');
  
  const startTime = Date.now();
  let modelUsed = 'unknown';
  let errors = [];

  try {
    // Try OpenAI first (most reliable for structured output)
    if (openai) {
      console.log('Attempting OpenAI transformation...');
      try {
        const result = await transformWithOpenAI(text, preferences);
        modelUsed = 'openai';
        console.log('OpenAI transformation successful');
        return {
          ...result,
          aiProcessingDetails: {
            modelUsed,
            processingTime: Date.now() - startTime,
            confidence: 0.95
          }
        };
      } catch (error) {
        errors.push(`OpenAI failed: ${error.message}`);
        console.warn('OpenAI failed, trying fallback:', error.message);
      }
    } else {
      console.log('OpenAI client not available');
    }

    // Try Anthropic as second choice
    if (anthropic) {
      console.log('Attempting Anthropic transformation...');
      try {
        const result = await transformWithAnthropic(text, preferences);
        modelUsed = 'anthropic';
        console.log('Anthropic transformation successful');
        return {
          ...result,
          aiProcessingDetails: {
            modelUsed,
            processingTime: Date.now() - startTime,
            confidence: 0.90
          }
        };
      } catch (error) {
        errors.push(`Anthropic failed: ${error.message}`);
        console.warn('Anthropic failed, trying fallback:', error.message);
      }
    } else {
      console.log('Anthropic client not available');
    }

    // Try Google as third choice
    if (genAI) {
      console.log('Attempting Google transformation...');
      try {
        const result = await transformWithGoogle(text, preferences);
        modelUsed = 'google';
        console.log('Google transformation successful');
        return {
          ...result,
          aiProcessingDetails: {
            modelUsed,
            processingTime: Date.now() - startTime,
            confidence: 0.85
          }
        };
      } catch (error) {
        errors.push(`Google failed: ${error.message}`);
        console.warn('Google failed:', error.message);
      }
    } else {
      console.log('Google client not available');
    }

    // If all AI models fail, use basic parsing
    console.warn('All AI models failed, using basic parsing');
    const basicResult = await basicCVParsing(text);
    return {
      ...basicResult,
      aiProcessingDetails: {
        modelUsed: 'basic-parsing',
        processingTime: Date.now() - startTime,
        confidence: 0.60,
        errors
      }
    };

  } catch (error) {
    console.error('AI transformation completely failed:', error);
    throw new Error(`AI transformation failed: ${error.message}`);
  }
}

/**
 * Transform CV using OpenAI GPT-4
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformWithOpenAI(text, preferences) {
  console.log('OpenAI transformation started');
  const prompt = createEHSFormattedPrompt(text, preferences);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert CV transformation specialist. Transform the given CV text according to EHS formatting standards. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const response = completion.choices[0].message.content;
    console.log('OpenAI response received, length:', response.length);
    return parseAIResponse(response);
  } catch (error) {
    console.error('OpenAI transformation error:', error);
    throw error;
  }
}

/**
 * Transform CV using Anthropic Claude
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformWithAnthropic(text, preferences) {
  const prompt = createEHSFormattedPrompt(text, preferences);
  
  const message = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 4000,
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const response = message.content[0].text;
  return parseAIResponse(response);
}

/**
 * Transform CV using Google Gemini
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformWithGoogle(text, preferences) {
  const prompt = createEHSFormattedPrompt(text, preferences);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return parseAIResponse(response);
}

/**
 * Create EHS formatting prompt for AI models
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {string} - Formatted prompt
 */
function createEHSFormattedPrompt(text, preferences) {
  return `Transform the following CV text according to EHS formatting standards:

CV TEXT:
${text}

EHS FORMATTING REQUIREMENTS:
1. Typography: Use Palatino Linotype font throughout
2. Photo: Size to 4.7cm (convert landscape to portrait if needed)
3. Dates: Use first 3 letters only (Jan 2020, not January 2020)
4. Capitalization: Job titles always start with capital letters
5. Structure:
   - Header: Name, Job Title, Professional Photo
   - Personal Details: Nationality, Languages, DOB, Marital Status
   - Profile: Professional summary
   - Experience: Reverse chronological, bullet-pointed
   - Education: Consistent formatting
   - Key Skills: Bullet-pointed
   - Interests: Bullet-pointed

6. Content Cleanup:
   - Remove "I am responsible for" → "Responsible for"
   - Fix: "Principle" → "Principal", "Discrete" → "Discreet"
   - Remove: Age, Dependants
   - Convert paragraphs to bullet points
   - Ensure professional tone

7. File Naming: FirstName (Candidate BH No) Client CV

Return the transformed data in this exact JSON structure:
{
  "header": {
    "name": "string",
    "jobTitle": "string",
    "photoUrl": "string"
  },
  "personalDetails": {
    "nationality": "string",
    "languages": ["string"],
    "dateOfBirth": "string",
    "maritalStatus": "string",
    "contactInfo": {
      "email": "string",
      "phone": "string",
      "address": "string"
    }
  },
  "profile": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "year": "string"
    }
  ],
  "keySkills": ["string"],
  "interests": ["string"]
}

Ensure all text follows professional standards and EHS formatting rules.`;
}

/**
 * Parse AI response and extract structured data
 * @param {string} response - AI model response
 * @returns {Object} - Parsed CV data
 */
function parseAIResponse(response) {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAndCleanData(parsed);
    }
    
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Validate and clean parsed data
 * @param {Object} data - Parsed CV data
 * @returns {Object} - Cleaned and validated data
 */
function validateAndCleanData(data) {
  const cleaned = {
    header: {
      name: data.header?.name || 'Unknown',
      jobTitle: data.header?.jobTitle || 'Professional',
      photoUrl: data.header?.photoUrl || ''
    },
    personalDetails: {
      nationality: data.personalDetails?.nationality || '',
      languages: Array.isArray(data.personalDetails?.languages) ? data.personalDetails.languages : [],
      dateOfBirth: data.personalDetails?.dateOfBirth || '',
      maritalStatus: data.personalDetails?.maritalStatus || '',
      contactInfo: {
        email: data.personalDetails?.contactInfo?.email || '',
        phone: data.personalDetails?.contactInfo?.phone || '',
        address: data.personalDetails?.contactInfo?.address || ''
      }
    },
    profile: data.profile || '',
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    keySkills: Array.isArray(data.keySkills) ? data.keySkills : [],
    interests: Array.isArray(data.interests) ? data.interests : []
  };

  // Apply EHS formatting rules
  cleaned.header.jobTitle = applyEHSFormatting(cleaned.header.jobTitle);
  cleaned.profile = applyEHSFormatting(cleaned.profile);
  
  // Clean experience entries
  cleaned.experience = cleaned.experience.map(exp => ({
    ...exp,
    position: applyEHSFormatting(exp.position),
    responsibilities: exp.responsibilities.map(resp => applyEHSFormatting(resp))
  }));

  return cleaned;
}

/**
 * Apply EHS formatting rules to text
 * @param {string} text - Raw text
 * @returns {string} - Formatted text
 */
function applyEHSFormatting(text) {
  if (!text) return '';
  
  let formatted = text;
  
  // Fix common mistakes
  formatted = formatted
    .replace(/\bPrinciple\b/g, 'Principal')
    .replace(/\bDiscrete\b/g, 'Discreet')
    .replace(/\bI am responsible for\b/gi, 'Responsible for')
    .replace(/\bI am\b/gi, '')
    .replace(/\bI have\b/gi, '')
    .replace(/\bI can\b/gi, 'Can')
    .replace(/\bI will\b/gi, 'Will');
  
  // Ensure proper capitalization for job titles
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  return formatted.trim();
}

/**
 * Basic CV parsing when AI models fail
 * @param {string} text - Raw CV text
 * @returns {Object} - Basic parsed CV data
 */
async function basicCVParsing(text) {
  console.log('Using basic CV parsing fallback');
  
  try {
    // Simple text extraction and formatting
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract basic information
    const name = lines[0] || 'Unknown Name';
    const email = lines.find(line => line.includes('@')) || '';
    const phone = lines.find(line => /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(line)) || '';
    
    // Extract experience (look for common patterns)
    const experienceLines = lines.filter(line => 
      line.toLowerCase().includes('experience') || 
      line.toLowerCase().includes('work') ||
      line.toLowerCase().includes('employment')
    );
    
    // Extract education
    const educationLines = lines.filter(line => 
      line.toLowerCase().includes('education') || 
      line.toLowerCase().includes('degree') ||
      line.toLowerCase().includes('university') ||
      line.toLowerCase().includes('college')
    );
    
    // Extract skills
    const skillsLines = lines.filter(line => 
      line.toLowerCase().includes('skill') || 
      line.toLowerCase().includes('technology') ||
      line.toLowerCase().includes('programming')
    );
    
    return {
      header: {
        name: name,
        jobTitle: 'Professional',
        photoUrl: ''
      },
      personalDetails: {
        nationality: '',
        languages: ['English'],
        dateOfBirth: '',
        maritalStatus: '',
        contactInfo: {
          email: email,
          phone: phone,
          address: ''
        }
      },
      profile: 'Professional with experience in various fields.',
      experience: experienceLines.length > 0 ? [{
        company: 'Company Name',
        position: 'Position Title',
        duration: 'Duration',
        responsibilities: ['Responsibility 1', 'Responsibility 2']
      }] : [],
      education: educationLines.length > 0 ? [{
        institution: 'Institution Name',
        degree: 'Degree',
        field: 'Field of Study',
        year: 'Year'
      }] : [],
      keySkills: skillsLines.length > 0 ? ['Skill 1', 'Skill 2', 'Skill 3'] : ['Communication', 'Problem Solving', 'Teamwork'],
      interests: ['Professional Development', 'Technology', 'Innovation']
    };
  } catch (error) {
    console.error('Basic parsing failed:', error);
    // Return minimal structure
    return {
      header: {
        name: 'Unknown Name',
        jobTitle: 'Professional',
        photoUrl: ''
      },
      personalDetails: {
        nationality: '',
        languages: ['English'],
        dateOfBirth: '',
        maritalStatus: '',
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        }
      },
      profile: 'Professional with experience in various fields.',
      experience: [],
      education: [],
      keySkills: ['Communication', 'Problem Solving', 'Teamwork'],
      interests: ['Professional Development', 'Technology', 'Innovation']
    };
  }
}

/**
 * Enhance specific content section
 * @param {string} content - Content to enhance
 * @param {string} section - Section type
 * @param {Object} preferences - Enhancement preferences
 * @returns {Promise<string>} - Enhanced content
 */
async function enhanceContent(content, section, preferences = {}) {
  // Implementation for content enhancement
  return content; // Placeholder
}

/**
 * Fix grammar and language issues
 * @param {string} content - Content to fix
 * @param {Object} preferences - Fixing preferences
 * @returns {Promise<string>} - Corrected content
 */
async function fixGrammar(content, preferences = {}) {
  // Implementation for grammar fixing
  return content; // Placeholder
}

module.exports = {
  transformCVWithAI,
  enhanceContent,
  fixGrammar
};