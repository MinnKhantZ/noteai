# NoteAI - AI-Powered Note Taking App 📝🤖

A modern, intelligent note-taking mobile application built with React Native and Expo, featuring AI-powered writing assistance using OpenAI GPT-4o. Create, organize, and enhance your notes with smart AI tools for grammar correction, summarization, auto-titling, and more.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933)
![Express.js](https://img.shields.io/badge/Express.js-4.21-000000)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991)

## ✨ Features

### 📱 Core Functionality
- **Smart Note Creation**: Write and save notes with title, body, and tags
- **AI Writing Assistant**: 5 AI tools — Suggest, Summarize, Auto-Title, Continue Writing, Fix Grammar
- **Folder Organization**: Create folders and assign notes for easy categorization
- **Tag System**: Add tags to notes with comma-confirm chip input
- **Pin & Archive**: Pin important notes to top, archive completed notes
- **Search & Filter**: Real-time search across titles and content, filter by tags and folders

### 🎨 User Experience
- **Clean Material Design**: Modern UI with React Native Paper components
- **Dark/Light Theme**: Automatic theme based on system setting
- **Smooth Animations**: Staggered card entrances, spring-animated FAB, swipe gestures
- **Swipe-to-Delete**: Swipe right on note cards to delete with undo via Snackbar
- **Offline-First**: All notes stored locally via AsyncStorage — works without internet
- **Loading States**: Visual feedback during AI processing

### 🤖 AI Capabilities
- **Suggest**: Get 3 rewritten versions of your note for improved grammar, clarity, and style
- **Summarize**: Condense your note into 2-3 concise sentences
- **Auto-Title**: Generate a short, descriptive title for your note
- **Continue Writing**: Naturally extend your note with 2-3 additional sentences
- **Fix Grammar**: Correct all grammar, spelling, and punctuation errors

### 🔧 Technical Features
- **Stateless Backend**: Lightweight Express API as AI proxy — no database required
- **Rate Limiting**: 20 requests/minute on AI endpoints to control costs
- **HTML Stripping**: Cleans note content before sending to OpenAI
- **Auto-Migration**: Detects and migrates old notes without UUIDs
- **React Compiler**: Enabled via Expo experiment flag for optimized renders

## 🛠️ Tech Stack

### Mobile App
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Navigation**: React Navigation v7 (Stack Navigator)
- **UI Components**: React Native Paper v5 (Material Design 3)
- **Animations**: React Native Reanimated v4 + React Native Animated
- **Gestures**: React Native Gesture Handler (swipe-to-delete)
- **Storage**: AsyncStorage for local persistence
- **HTTP Client**: Fetch API

### Backend API
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **AI Engine**: OpenAI GPT-4o
- **Security**: CORS, express-rate-limit (20 req/min)
- **Logging**: Morgan HTTP request logger

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **OpenAI API Key**: For AI features

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd noteai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

**Backend** (`backend/.env`):

```env
PORT=5000
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Frontend** (`frontend/.env`):

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start Development

```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Or start backend for production
npm start
```

### 5. Connect Your Device

- **Physical Device**: Install Expo Go app and scan QR code
- **Emulator/Simulator**: Automatically opens when running platform-specific commands

## 📁 Project Structure

```
noteai/
├── package.json                    # Root workspace config
├── .gitignore
├── README.md
│
├── backend/
│   ├── package.json
│   ├── index.js                    # Single-file Express server
│   └── README.md
│
└── frontend/
    ├── package.json
    ├── App.js                      # Main app with navigation
    ├── app.json                    # Expo configuration
    ├── eas.json                    # EAS Build configuration
    ├── theme.js                    # Design system
    ├── assets/
    ├── screens/
    │   ├── HomeScreen.js           # Note list with search, filter, sort
    │   ├── EditScreen.js           # Note editor with AI tools
    │   └── FolderScreen.js         # Folder management
    ├── components/
    │   ├── AIBottomSheet.js        # AI results modal
    │   ├── NoteCard.js             # Swipeable note card
    │   └── TagInput.js             # Tag chip input
    ├── contexts/
    │   └── ThemeContext.js          # Auto dark/light theme
    └── utils/
        └── storage.js              # AsyncStorage CRUD utilities
```

## 🔧 Configuration

### Expo Configuration

```json
{
  "expo": {
    "name": "NoteAI",
    "slug": "NoteAI",
    "version": "1.0.0",
    "orientation": "portrait",
    "experiments": { "reactCompiler": true },
    "ios": { "bundleIdentifier": "com.minkhantzaw.NoteAI" },
    "android": { "package": "com.minkhantzaw.NoteAI" }
  }
}
```

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | `backend/.env` | Server port (default: 5000) |
| `OPENAI_API_KEY` | `backend/.env` | OpenAI API key for GPT-4o |
| `EXPO_PUBLIC_API_URL` | `frontend/.env` | Backend URL |

## 🎯 Architecture

### Navigation Flow

1. **Home Screen**: Displays all notes with search, tag filter, folder filter, and sort options
   - Pinned notes shown at top with golden accent
   - Swipe right to delete with undo
   - FAB to create new note

2. **Edit Screen**: Full note editor with AI tools
   - Title input (optional)
   - Body text input (multiline)
   - Tag input with comma-confirm chips
   - Folder assignment dropdown
   - Pin/Archive toggle
   - AI tools bar with 5 actions
   - Word and character count

3. **Folder Screen**: Create, rename, and delete folders with note counts

### AI Integration

The backend acts as a stateless AI proxy to OpenAI GPT-4o:

```
POST /ai
{
  "action": "suggestions | summarize | auto-title | continue | fix-grammar",
  "content": "Your note content here..."
}

Response:
{
  "action": "suggestions",
  "result": ["Rewritten version 1", "Rewritten version 2", "Rewritten version 3"]
}
```

### Data Model

**Note**:
```
{
  id: string (UUID),
  title: string,
  content: string,
  tags: string[],
  folderId: string | null,
  isPinned: boolean,
  isArchived: boolean,
  createdAt: number,
  updatedAt: number
}
```

**Folder**:
```
{
  id: string (UUID),
  name: string,
  createdAt: number
}
```

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/ai` | Unified AI endpoint with `action` parameter |
| POST | `/suggestions` | Legacy endpoint (backward compatibility) |

### AI Actions

| Action | Description | Response |
|--------|-------------|----------|
| `suggestions` | 3 rewritten versions | Array of 3 strings |
| `summarize` | 2-3 sentence summary | Single string |
| `auto-title` | Generate title (5 words max) | Single string |
| `continue` | Continue writing 2-3 sentences | Single string |
| `fix-grammar` | Correct grammar/spelling | Single string |

## 🚀 Deployment

### Build for Production

```bash
# Build for Android APK
npx eas build --platform android

# Build for iOS
npx eas build --platform ios
```

### Backend Deployment

Deploy `backend/` to Render, Railway, or any Node.js host:

```env
PORT=5000
OPENAI_API_KEY=your_production_api_key
```

Update `EXPO_PUBLIC_API_URL` in frontend to point to deployed backend.

### EAS Build Configuration

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## 🧪 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend only |
| `npm run dev:backend` | Backend with file watching |
| `npm run dev:frontend` | Start Expo dev server |
| `npm start` | Start backend (production) |

## 🐛 Troubleshooting

**Metro bundler issues:**
```bash
npx expo start --clear
```

**Backend not reachable:**
- Check `EXPO_PUBLIC_API_URL` matches backend port
- Verify backend is running with `npm run dev:backend`
- Ensure OpenAI API key is valid

**AI suggestions failing:**
- Check OpenAI API key in `backend/.env`
- Verify rate limit not exceeded (20 req/min)
- Check backend logs for API errors

**AsyncStorage not working:**
- Ensure proper permissions on device
- Check for storage space

**Build failures:**
```bash
npx expo install --fix
rm -rf node_modules .expo
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for excellent libraries
- **OpenAI** for GPT-4o API
- **React Native Paper** for beautiful Material Design components
- **React Native Reanimated** for smooth animations

---

**Built with ❤️ for smarter note-taking**
