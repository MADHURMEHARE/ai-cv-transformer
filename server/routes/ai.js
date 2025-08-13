const express = require('express');
const { transformCVWithAI, enhanceContent, fixGrammar } = require('../services/aiService');

const router = express.Router();

// Transform raw CV text with AI
router.post('/transform', async (req, res) => {
  try {
    const { text, preferences = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const startTime = Date.now();
    const transformedData = await transformCVWithAI(text, preferences);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      transformedData,
      processingTime,
      message: 'CV transformed successfully'
    });

  } catch (error) {
    console.error('AI transformation error:', error);
    res.status(500).json({ 
      error: 'Failed to transform CV',
      details: error.message 
    });
  }
});

// Enhance specific section content
router.post('/enhance', async (req, res) => {
  try {
    const { content, section, preferences = {} } = req.body;
    
    if (!content || !section) {
      return res.status(400).json({ error: 'Content and section are required' });
    }

    const enhancedContent = await enhanceContent(content, section, preferences);

    res.json({
      success: true,
      enhancedContent,
      message: 'Content enhanced successfully'
    });

  } catch (error) {
    console.error('Content enhancement error:', error);
    res.status(500).json({ 
      error: 'Failed to enhance content',
      details: error.message 
    });
  }
});

// Fix grammar and language issues
router.post('/fix-grammar', async (req, res) => {
  try {
    const { content, preferences = {} } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const correctedContent = await fixGrammar(content, preferences);

    res.json({
      success: true,
      correctedContent,
      message: 'Grammar fixed successfully'
    });

  } catch (error) {
    console.error('Grammar fixing error:', error);
    res.status(500).json({ 
      error: 'Failed to fix grammar',
      details: error.message 
    });
  }
});

// Get AI model status and capabilities
router.get('/status', async (req, res) => {
  try {
    const models = {
      openai: {
        available: !!process.env.OPENAI_API_KEY,
        models: ['gpt-4', 'gpt-3.5-turbo'],
        capabilities: ['text-generation', 'content-structuring', 'language-enhancement']
      },
      anthropic: {
        available: !!process.env.ANTHROPIC_API_KEY,
        models: ['claude-3-sonnet', 'claude-3-haiku'],
        capabilities: ['content-analysis', 'formatting', 'professional-tone']
      },
      google: {
        available: !!process.env.GOOGLE_API_KEY,
        models: ['gemini-pro'],
        capabilities: ['text-processing', 'content-optimization']
      }
    };

    res.json({
      success: true,
      models,
      activeModels: Object.keys(models).filter(key => models[key].available)
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check AI status' });
  }
});

// Test AI connection
router.post('/test', async (req, res) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      return res.status(400).json({ error: 'Model specification is required' });
    }

    let testResult;
    switch (model) {
      case 'openai':
        testResult = await testOpenAI();
        break;
      case 'anthropic':
        testResult = await testAnthropic();
        break;
      case 'google':
        testResult = await testGoogle();
        break;
      default:
        return res.status(400).json({ error: 'Invalid model specified' });
    }

    res.json({
      success: true,
      model,
      testResult,
      message: 'AI connection test completed'
    });

  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({ 
      error: 'AI connection test failed',
      details: error.message 
    });
  }
});

// Test functions for each AI provider
async function testOpenAI() {
  // Implement OpenAI connection test
  return { status: 'available', responseTime: 'fast' };
}

async function testAnthropic() {
  // Implement Anthropic connection test
  return { status: 'available', responseTime: 'fast' };
}

async function testGoogle() {
  // Implement Google connection test
  return { status: 'available', responseTime: 'fast' };
}

module.exports = router;