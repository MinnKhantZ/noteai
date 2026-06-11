# NoteAI Backend

Express.js API server providing AI-powered writing suggestions via OpenAI.

## Tech Stack

- Node.js 18+
- Express.js 4.x
- OpenAI API

## Setup

```bash
npm install
```

Create `.env` file:

```env
PORT=5000
OPENAI_API_KEY=your_api_key
```

## Scripts

```bash
npm start    # Production
npm run dev  # Development (with file watching)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/suggestions` | Get AI writing suggestions |
