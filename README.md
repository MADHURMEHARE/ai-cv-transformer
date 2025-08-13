# AI CV Transformer

An AI-powered web application that transforms raw, unstructured CVs into polished, professional documents using multiple AI models and modern web technologies.

## 🚀 Features

### Core Functionality
- **Multi-format Support**: Accepts PDF, DOCX, XLSX, and XLS files
- **AI-Powered Processing**: Uses GPT-4, Claude, and Gemini for intelligent content transformation
- **EHS Formatting Standards**: Automatically applies professional formatting rules
- **Real-time Processing**: Live status updates and progress tracking
- **Inline Editing**: Edit and refine transformed content before export
- **Multiple Export Formats**: Export to PDF, DOCX, and other formats

### Technical Features
- **Intelligent Fallback**: Multiple AI models with automatic fallback strategies
- **Robust File Processing**: Handles various file structures and edge cases
- **Professional UI/UX**: Clean, intuitive interface with responsive design
- **Real-time Updates**: WebSocket-like polling for processing status
- **Session Management**: Track multiple CVs per user session

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **File Processing**: PDF-parse, Mammoth, XLSX libraries
- **Styling**: Tailwind CSS with custom design system

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (OpenAI,      │
│                 │    │                 │    │    Claude,      │
│   • File Upload │    │   • File Upload │    │    Gemini)      │
│   • CV Preview  │    │   • Processing  │    │                 │
│   • Editor      │    │   • AI Pipeline │    │                 │
│   • Export      │    │   • Database    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   • CV Storage  │
                       │   • Metadata    │
                       │   • Processing  │
                       │     History     │
                       └─────────────────┘
```

## 📋 EHS Formatting Standards

The AI automatically applies these professional formatting rules:

### Typography & Structure
- **Font**: Palatino Linotype throughout
- **Photo Sizing**: 4.7cm (handles landscape → portrait conversion)
- **Date Format**: First 3 letters only (Jan 2020, not January 2020)
- **Capitalization**: Job titles always start with capital letters

### Content Organization
1. **Header**: Name, Job Title, Professional Photo
2. **Personal Details**: Nationality, Languages, DOB, Marital Status
3. **Profile**: Professional summary
4. **Experience**: Reverse chronological, bullet-pointed
5. **Education**: Consistent formatting
6. **Key Skills**: Bullet-pointed
7. **Interests**: Bullet-pointed

### Content Cleanup Rules
- Remove redundant phrases: "I am responsible for" → "Responsible for"
- Fix common mistakes: "Principle" → "Principal", "Discrete" → "Discreet"
- Remove inappropriate fields: Age, Dependants
- Convert paragraphs to bullet points
- Ensure professional tone throughout

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5+
- AI API keys (OpenAI, Anthropic, Google)

### 1. Clone Repository
```bash
git clone https://github.com/MADHURMEHARE/ai-cv-transformer.git
cd ai-cv-transformer
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

Required environment variables:
```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cv-transformer

# Server
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run Application

#### Development Mode
```bash
# Terminal 1: Start backend server
cd server
npm start

# Terminal 2: Start frontend
npm run dev
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
cd server
NODE_ENV=production npm start
```

## 🎯 Usage

### 1. Upload CV
- Drag and drop or click to browse
- Supported formats: PDF, DOCX, XLSX, XLS
- Maximum file size: 10MB

### 2. AI Processing
- File is automatically processed using AI
- Multiple AI models ensure reliability
- Processing typically takes 1-3 minutes

### 3. Review & Edit
- Preview transformed CV
- Edit any section inline
- Add/remove experience, education, skills

### 4. Export
- Download in multiple formats
- Professional EHS-compliant output
- Ready for recruitment use

## 🔧 API Endpoints

### CV Management
```
POST   /api/cv/upload          - Upload CV file
GET    /api/cv/:id             - Get CV by ID
GET    /api/cv/session/:id     - Get CVs by session
PUT    /api/cv/:id             - Update CV data
DELETE /api/cv/:id             - Delete CV
POST   /api/cv/:id/export      - Export CV
GET    /api/cv/download/:file  - Download exported file
```

### AI Services
```
POST   /api/ai/transform       - Transform CV with AI
POST   /api/ai/enhance         - Enhance specific content
POST   /api/ai/fix-grammar     - Fix grammar issues
GET    /api/ai/status          - Check AI model status
POST   /api/ai/test            - Test AI connections
```

### Health Check
```
GET    /api/health             - Server health status
```

## 🧠 AI Model Integration

### Model Selection Strategy
1. **OpenAI GPT-4** (Primary): Best for structured output and formatting
2. **Anthropic Claude** (Secondary): Excellent for content analysis
3. **Google Gemini** (Tertiary): Good for text processing
4. **Basic Parser** (Fallback): Regex-based extraction when AI fails

### Prompt Engineering
- Structured prompts for consistent output
- EHS formatting rules embedded in prompts
- Error handling and validation
- Confidence scoring for quality assurance

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Professional blues and grays
- **Typography**: Inter for UI, Palatino for CV content
- **Components**: Reusable, accessible design components
- **Responsive**: Mobile-first responsive design

### User Experience
- **Drag & Drop**: Intuitive file upload
- **Real-time Feedback**: Processing status updates
- **Inline Editing**: Seamless content modification
- **Progress Indicators**: Clear processing feedback
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **File Validation**: Type and size restrictions
- **Input Sanitization**: XSS and injection protection
- **Rate Limiting**: API abuse prevention
- **Session Management**: Secure user sessions
- **CORS Configuration**: Cross-origin request handling

## 📊 Performance Optimization

- **Asynchronous Processing**: Non-blocking file operations
- **Database Indexing**: Optimized queries
- **File Streaming**: Efficient file handling
- **Caching**: AI response caching
- **Compression**: Gzip compression for responses

## 🚀 Deployment

### Production Setup
```bash
# Build application
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Start server
cd server
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
OPENAI_API_KEY=your_production_key
ANTHROPIC_API_KEY=your_production_key
GOOGLE_API_KEY=your_production_key
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for components and services
- Integration tests for API endpoints
- E2E tests for user workflows
- AI model integration tests

## 📈 Monitoring & Analytics

- **Performance Metrics**: Response times, throughput
- **Error Tracking**: AI failures, processing errors
- **Usage Analytics**: File types, processing success rates
- **Health Checks**: Database, AI service status

## 🔮 Future Enhancements

### Planned Features
- **User Authentication**: Secure user accounts
- **Template Library**: Pre-built CV templates
- **Batch Processing**: Multiple CV processing
- **Advanced AI**: Custom training for specific industries
- **Collaboration**: Team editing and review
- **Version Control**: CV revision history

### Technical Improvements
- **WebSocket**: Real-time updates
- **Redis**: Session and cache management
- **Microservices**: Scalable architecture
- **Kubernetes**: Container orchestration
- **CDN**: Global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Maintain test coverage above 80%
- Follow the established code style
- Document new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Anthropic** for Claude API
- **Google** for Gemini API
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MADHURMEHARE/ai-cv-transformer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MADHURMEHARE/ai-cv-transformer/discussions)
- **Email**: [Contact Support](mailto:support@example.com)

---

**Built with ❤️ by the AI CV Transformer Team**

*Transform your CVs with the power of AI*