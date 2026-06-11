# NoteAI Frontend

React Native mobile app for AI-powered note taking, built with Expo.

## Tech Stack

- React Native 0.81.x
- Expo SDK 54
- React Navigation 7
- React Native Paper 5
- AsyncStorage

## Setup

```bash
npm install
```

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

## Project Structure

```
frontend/
├── App.js         # Main component with navigation
├── screens/       # Screen components
├── components/    # Reusable UI components
├── contexts/      # React contexts
├── utils/         # Utility functions
└── theme.js       # Theme configuration
```
