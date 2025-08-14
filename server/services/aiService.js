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
 * Transform CV using OpenAI GPT-4 with EHS formatting standards
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
          content: `You are an expert CV transformation specialist with deep knowledge of EHS (Executive Headhunting Services) formatting standards. Your task is to transform raw CV text into a professionally formatted, structured document that follows all EHS requirements exactly.

IMPORTANT: You must return ONLY valid JSON in the exact structure specified. Do not include any explanations, markdown, or additional text.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
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
 * Transform CV using Anthropic Claude with EHS formatting standards
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformWithAnthropic(text, preferences) {
  console.log('Anthropic transformation started');
  const prompt = createEHSFormattedPrompt(text, preferences);
  
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const response = message.content[0].text;
    console.log('Anthropic response received, length:', response.length);
    return parseAIResponse(response);
  } catch (error) {
    console.error('Anthropic transformation error:', error);
    throw error;
  }
}

/**
 * Transform CV using Google Gemini with EHS formatting standards
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Transformed CV data
 */
async function transformWithGoogle(text, preferences) {
  console.log('Google transformation started');
  const prompt = createEHSFormattedPrompt(text, preferences);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('Google response received, length:', response.length);
    return parseAIResponse(response);
  } catch (error) {
    console.error('Google transformation error:', error);
    throw error;
  }
}

/**
 * Create comprehensive EHS formatting prompt for AI models
 * @param {string} text - Raw CV text
 * @param {Object} preferences - User preferences
 * @returns {string} - Formatted prompt
 */
function createEHSFormattedPrompt(text, preferences) {
  return `Transform the following raw CV text into a professionally formatted document following EHS (Executive Headhunting Services) standards EXACTLY.

RAW CV TEXT:
${text}

EHS FORMATTING REQUIREMENTS - FOLLOW THESE RULES EXACTLY:

1. TYPOGRAPHY & STRUCTURE:
   - Font: Palatino Linotype throughout (specify in output)
   - Photo Sizing: 4.7cm (handle landscape → portrait conversion)
   - Date Format: First 3 letters only (Jan 2020, not January 2020)
   - Capitalization: Job titles ALWAYS start with capital letters
   - Professional formatting with consistent spacing

2. CONTENT ORGANIZATION (MUST FOLLOW THIS ORDER):
   - Header: Full Name, Job Title, Professional Photo URL
   - Personal Details: Nationality, Languages, DOB, Marital Status
   - Profile: Professional summary (2-3 sentences max)
   - Experience: Reverse chronological order, bullet-pointed responsibilities
   - Education: Consistent formatting with degree, field, institution, year
   - Key Skills: Bullet-pointed, relevant to the role
   - Interests: Bullet-pointed, professional and relevant

3. CONTENT CLEANUP RULES (APPLY THESE TRANSFORMATIONS):
   - Remove redundant phrases: "I am responsible for" → "Responsible for"
   - Fix common mistakes: "Principle" → "Principal", "Discrete" → "Discreet"
   - Remove inappropriate fields: Age, Dependants, Personal opinions
   - Convert long paragraphs to bullet points
   - Ensure professional tone throughout
   - Remove informal language and slang
   - Standardize job titles and company names

4. FILE NAMING FORMAT:
   - Format: "FirstName (Candidate BH No) Client CV"
   - Example: "John (BH001) Client CV"

5. EXPERIENCE FORMATTING:
   - Company Name (Bold)
   - Job Title (Capitalized, Professional)
   - Duration (Month Year - Month Year format)
   - Responsibilities as bullet points (start with action verbs)

6. EDUCATION FORMATTING:
   - Degree Type (e.g., Bachelor's, Master's, PhD)
   - Field of Study
   - Institution Name
   - Graduation Year (3-letter month format)

7. SKILLS & INTERESTS:
   - Relevant technical skills
   - Soft skills (communication, leadership, etc.)
   - Professional interests only
   - Remove personal hobbies unless relevant

CRITICAL: Return ONLY valid JSON in this EXACT structure:
{
  "header": {
    "name": "Full Name",
    "jobTitle": "Professional Job Title",
    "photoUrl": "Photo URL or placeholder"
  },
  "personalDetails": {
    "nationality": "Nationality",
    "languages": ["Language 1", "Language 2"],
    "dateOfBirth": "DOB in DD/MM/YYYY format",
    "maritalStatus": "Marital Status",
    "contactInfo": {
      "email": "Email Address",
      "phone": "Phone Number",
      "address": "Full Address"
    }
  },
  "profile": "Professional summary in 2-3 sentences",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Jan 2020 - Dec 2023",
      "responsibilities": [
        "Responsibility 1 starting with action verb",
        "Responsibility 2 starting with action verb",
        "Responsibility 3 starting with action verb"
      ]
    }
  ],
  "education": [
    {
      "institution": "Institution Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "year": "Jan 2020"
    }
  ],
  "keySkills": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ],
  "interests": [
    "Professional Interest 1",
    "Professional Interest 2"
  ]
}

IMPORTANT: 
- Apply ALL EHS formatting rules strictly
- Ensure professional tone throughout
- Remove any inappropriate or personal content
- Format dates correctly (3-letter month format)
- Capitalize job titles properly
- Convert paragraphs to bullet points
- Return ONLY the JSON structure above`;
}

/**
 * Parse AI response and extract structured data
 * @param {string} response - AI model response
 * @returns {Object} - Parsed CV data
 */
function parseAIResponse(response) {
  try {
    console.log('Parsing AI response...');
    
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('JSON parsed successfully, validating...');
      return validateAndCleanData(parsed);
    }
    
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response content:', response);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Validate and clean parsed data according to EHS standards
 * @param {Object} data - Parsed CV data
 * @returns {Object} - Cleaned and validated data
 */
function validateAndCleanData(data) {
  console.log('Validating and cleaning data...');
  
  const cleaned = {
    header: {
      name: data.header?.name || 'Unknown Name',
      jobTitle: data.header?.jobTitle || 'Professional',
      photoUrl: data.header?.photoUrl || ''
    },
    personalDetails: {
      nationality: data.personalDetails?.nationality || '',
      languages: Array.isArray(data.personalDetails?.languages) ? data.personalDetails.languages : ['English'],
      dateOfBirth: data.personalDetails?.dateOfBirth || '',
      maritalStatus: data.personalDetails?.maritalStatus || '',
      contactInfo: {
        email: data.personalDetails?.contactInfo?.email || '',
        phone: data.personalDetails?.contactInfo?.phone || '',
        address: data.personalDetails?.contactInfo?.address || ''
      }
    },
    profile: data.profile || 'Professional with experience in various fields.',
    experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
      company: exp.company || 'Company Name',
      position: exp.position || 'Position Title',
      duration: exp.duration || 'Duration',
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : ['Responsibility']
    })) : [],
    education: Array.isArray(data.education) ? data.education.map(edu => ({
      institution: edu.institution || 'Institution Name',
      degree: edu.degree || 'Degree',
      field: edu.field || 'Field of Study',
      year: edu.year || 'Year'
    })) : [],
    keySkills: Array.isArray(data.keySkills) ? data.keySkills : ['Communication', 'Problem Solving', 'Teamwork'],
    interests: Array.isArray(data.interests) ? data.interests : ['Professional Development', 'Technology', 'Innovation']
  };

  // Apply EHS formatting rules
  cleaned.header.jobTitle = applyEHSFormatting(cleaned.header.jobTitle);
  cleaned.profile = applyEHSFormatting(cleaned.profile);
  
  // Format experience
  cleaned.experience = cleaned.experience.map(exp => ({
    ...exp,
    position: applyEHSFormatting(exp.position),
    responsibilities: exp.responsibilities.map(resp => applyEHSFormatting(resp))
  }));

  console.log('Data validation and cleaning completed');
  return cleaned;
}

/**
 * Apply EHS formatting rules to text
 * @param {string} text - Raw text
 * @returns {string} - Formatted text
 */
function applyEHSFormatting(text) {
  if (!text) return text;
  
  let formatted = text;
  
  // Fix common mistakes
  formatted = formatted.replace(/Principle/g, 'Principal');
  formatted = formatted.replace(/Discrete/g, 'Discreet');
  
  // Remove redundant phrases
  formatted = formatted.replace(/I am responsible for/gi, 'Responsible for');
  formatted = formatted.replace(/I am in charge of/gi, 'In charge of');
  formatted = formatted.replace(/I have experience in/gi, 'Experience in');
  
  // Capitalize job titles
  formatted = formatted.replace(/\b(manager|director|engineer|analyst|consultant|specialist|coordinator|assistant|supervisor|lead)\b/gi, 
    (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  );
  
  // Ensure professional tone
  formatted = formatted.replace(/\b(awesome|amazing|cool|great|fantastic)\b/gi, 'excellent');
  formatted = formatted.replace(/\b(very|really|quite)\s+/gi, '');
  
  return formatted;
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

module.exports = {
  transformCVWithAI
};