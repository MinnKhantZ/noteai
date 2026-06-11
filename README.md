# NoteAI

AI-powered note-taking application with intelligent writing suggestions.

## Tech Stack

- **Backend**: Node.js, Express.js, OpenAI API
- **Frontend**: React Native, Expo, React Navigation, React Native Paper

## Project Structure

```
noteai/
├── backend/          # Express.js API server
│   ├── index.js      # Main application
│   └── package.json
├── frontend/         # React Native mobile app
│   ├── App.js        # Main component
│   ├── screens/      # Screen components
│   ├── components/   # Reusable components
│   └── package.json
├── package.json      # Root workspace config
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Install Dependencies

```bash
npm install
```

### Environment Variables

**Backend** (`backend/.env`):

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
```

**Frontend** (`frontend/.env`):

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### Development

```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Start backend (production)
npm start
```

### Deployment

- **Backend**: Deploy to Render, Railway, or similar platform
- **Frontend**: Build with EAS (`npx eas build`) or deploy to app stores

Set the root directory to `backend` or `frontend` on your deployment platform.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/suggestions` | Get AI writing suggestions |

## License

MIT
