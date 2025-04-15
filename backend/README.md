# AWS Cloud Automation Backend

This is the backend server for the AWS Cloud Automation AI Agent. It handles communication with AWS services and provides an AI-powered interface for managing cloud resources.

## Features

- Express.js server with CORS support
- Integration with Gemini AI for natural language processing
- AWS service deployment functions (EC2, S3, RDS)
- Error handling and logging
- Environment-based configuration

## Prerequisites

- Node.js 18.x or later
- Gemini API key
- AWS credentials with appropriate permissions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your Gemini API key and other configurations

3. Start the server:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `GEMINI_API_KEY`: Your Gemini API key
- `GEMINI_API_URL`: Gemini API endpoint
- `DEPLOYMENT_API_URL`: AWS Lambda deployment endpoint

## API Endpoints

### POST /chat
Handles chat interactions with the AI assistant.

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "your message" }
  ],
  "context": {
    // Additional context if needed
  }
}
```

Response:
```json
{
  "response": "AI assistant's response"
}
```

## Error Handling

The server includes error handling middleware that:
- Logs errors to the console
- Returns appropriate HTTP status codes
- Provides user-friendly error messages

## Development

- Use `npm run dev` for development with auto-reload
- The server runs on `http://localhost:3001` by default
- All API endpoints are prefixed with `/api`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 