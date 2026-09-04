# TruthCheck AI Server

Backend server for TruthCheck AI - AI-powered detection of scams, phishing, and fake news.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Gemini API Key (required)
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_google_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and paste it in your `.env` file

### 4. Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and basic information.

### Content Analysis
```
POST /analyze
```
Analyzes content for scams, phishing, or fake news.

**Request Body:**
```json
{
  "prompt": "Your content analysis prompt here"
}
```

**Response:**
```json
{
  "result": "AI analysis result",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Features

- ✅ Gemini AI integration for content analysis
- ✅ Rate limiting (10 requests per minute for analysis)
- ✅ CORS support for frontend integration
- ✅ Security headers with Helmet
- ✅ Error handling and logging
- ✅ Input validation and sanitization
- ✅ Health check endpoint

## Deployment

The server is ready for deployment on:
- Render
- Railway
- Heroku
- Vercel (serverless)
- Any Node.js hosting provider

Make sure to set the environment variables in your deployment platform.

## Security

- Rate limiting prevents abuse
- Input validation and size limits
- CORS configuration for frontend access
- Security headers for protection
- API key validation 