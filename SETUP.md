# 🚀 Quick Setup Guide - AI CV Transformer

## ⚡ Get Started in 5 Minutes

### 1. Clone the Repository
```bash
git clone https://github.com/MADHURMEHARE/ai-cv-transformer.git
cd ai-cv-transformer
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables
```bash
# Copy the template
cp .env.template .env

# Edit with your API keys
nano .env
```

**Required API Keys:**
- **OpenAI**: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic** (optional): Get from [https://console.anthropic.com/](https://console.anthropic.com/)
- **Google AI** (optional): Get from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 4. Start MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start MongoDB service
sudo systemctl start mongod
```

### 5. Run the Application
```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend
npm run dev
```

### 6. Open Your Browser
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000](http://localhost:5000)

## 🔑 API Key Setup

### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key and add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

### Anthropic API Key (Optional)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create account
3. Navigate to API Keys
4. Create new key and add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

### Google AI API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create API key
4. Add to `.env`:
   ```env
   GOOGLE_API_KEY=your-actual-key-here
   ```

## 🎯 Test the Application

1. **Upload a CV**: Drag & drop a PDF, DOCX, or Excel file
2. **Watch AI Processing**: Real-time status updates
3. **Preview Results**: See transformed CV with EHS formatting
4. **Edit & Export**: Make adjustments and download

## 🚀 Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/MADHURMEHARE/ai-cv-transformer/issues)
- **Documentation**: [README.md](README.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Happy CV Transforming! 🎉**