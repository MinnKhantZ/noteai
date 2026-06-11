# NoteAI - AI-Powered Note Taking App 📝🤖

A modern, intelligent note-taking mobile application built with React Native and Expo, featuring AI-powered writing suggestions using Google Gemini.

![React Native](https://img.shields.io/badge/React%20Native-0.76.6-blue)
![Expo](https://img.shields.io/badge/Expo-~52.0.28-black)
![Google Gemini](https://img.shields.io/badge/Google-Gemini-orange)

## ✨ Features

### 📱 Core Functionality
- **Smart Note Creation**: Write and save notes with rich text editing
- **Local Storage**: Persistent note storage using AsyncStorage
- **Intuitive Navigation**: Seamless navigation between note list and editing
- **AI Writing Assistant**: Get intelligent suggestions to improve your notes
- **Real-time Suggestions**: Instant AI feedback as you write

### 🎨 User Experience
- **Clean UI**: Modern Material Design with React Native Paper
- **Responsive Design**: Optimized for mobile devices
- **Gesture Navigation**: Smooth transitions and interactions
- **Dark/Light Themes**: Automatic theme adaptation
- **Loading States**: Visual feedback during AI processing

### 🔧 Technical Features
- **Offline-First**: Works without internet for basic note operations
- **API Integration**: Seamless backend communication for AI features
- **Error Handling**: Robust error management and user feedback
- **Performance Optimized**: Efficient rendering and state management

## 🛠️ Tech Stack

- **Framework**: React Native 0.76.6 with Expo SDK 52
- **Navigation**: React Navigation v7 (Stack Navigator)
- **UI Components**: React Native Paper v5
- **Storage**: AsyncStorage for local persistence
- **HTTP Client**: Axios for API communication
- **Animations**: React Native Reanimated v3
- **Icons**: React Native Vector Icons
- **AI Backend**: Google Gemini 2.5 Flash

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd NoteAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run android    # Android emulator/device
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser
```

### 4. Connect Your Device

- **Physical Device**: Install Expo Go app and scan QR code
- **Emulator/Simulator**: Automatically opens when running platform-specific commands

## 📁 Project Structure

```
NoteAI/
├── App.js                 # Main application component with navigation
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies and scripts
├── assets/               # Static assets (images, fonts)
├── .expo/                # Expo development files
└── node_modules/         # Dependencies
```

## 🔧 Configuration

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "NoteAI",
    "slug": "noteai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### Environment Variables

The app connects to the NoteAI backend API. The backend URL is hardcoded in the app:

```javascript
const response = await fetch("https://noteaibackend.onrender.com/suggestions", {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ content }),
});
```

## 🎯 App Architecture

### Navigation Flow

1. **Home Screen**: Displays list of saved notes
   - Scrollable note previews
   - Add new note FAB button
   - Tap to edit existing notes

2. **Edit Screen**: Note creation/editing interface
   - Multi-line text input
   - AI suggestion button
   - Save/Delete actions
   - Real-time suggestion display

### Data Management

- **Local Storage**: Notes stored as JSON array in AsyncStorage
- **State Management**: React hooks for component state
- **API Communication**: Axios/fetch for backend AI suggestions

### AI Integration

The app integrates with a custom backend that uses Google Gemini AI to provide writing suggestions:

- **Input**: Current note content
- **Processing**: Gemini generates 3 improvement suggestions
- **Output**: Displayed as numbered list in the UI

## 🔐 Permissions

The app requires the following permissions:

- **Storage**: For saving notes locally (AsyncStorage)
- **Network**: For AI suggestion API calls

## 🚀 Deployment

### Build for Production

```bash
# Build for Android APK
npx eas build --platform android

# Build for iOS
npx eas build --platform ios

# Submit to stores
npx eas submit --platform android
npx eas submit --platform ios
```

### EAS Build Configuration

Configure `eas.json` for your build profiles:

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

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator (macOS only)
npm run web        # Run in web browser
```

### Code Style

- **ES6+ Features**: Modern JavaScript with async/await
- **Component Structure**: Functional components with hooks
- **Styling**: Inline styles with StyleSheet
- **Naming**: CamelCase for components, PascalCase for files

## 📱 UI Components

### Key Screens

- **HomeScreen**: Note list with FAB for new notes
- **EditScreen**: Note editor with AI suggestions

### UI Elements

- **FAB**: Floating Action Button for adding notes
- **TextInput**: Multi-line note input field
- **TouchableOpacity**: Interactive note cards and buttons
- **ScrollView**: Scrollable note lists and suggestions
- **ActivityIndicator**: Loading states for AI processing

## 🔗 API Integration

### Backend Endpoints

The app communicates with the NoteAI Backend API:

```typescript
POST /suggestions
Content-Type: application/json

{
  "content": "Your note content here..."
}

// Response
["Suggestion 1", "Suggestion 2", "Suggestion 3"]
```

### Error Handling

- Network errors display console warnings
- API failures are gracefully handled
- Loading states prevent multiple requests

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear cache and restart
npx expo start --clear
```

**AsyncStorage not working:**
- Ensure proper permissions on device
- Check for storage space

**AI suggestions not loading:**
- Verify internet connection
- Check backend API status
- Review console for network errors

**Build failures:**
```bash
# Clean and rebuild
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
- **Google AI** for Gemini API
- **React Native Paper** for beautiful UI components

---

**Built with ❤️ for smarter note-taking**</content>
<parameter name="filePath">c:\Users\Min\Documents\NoteAI\NoteAI\README.md