# Personalized Learning Path Generator

An AI-powered React application that generates personalized learning paths based on user preferences and integrates with Firebase for data persistence.

## Project Structure

The application has been modularized into the following structure:

```
├── main.js                     # Main App component
├── package.json               # Dependencies and scripts
├── config/
│   └── firebase.js            # Firebase configuration and initialization
├── hooks/
│   ├── useAuth.js             # Authentication hook
│   └── useLearningPaths.js    # Learning paths management hook
├── services/
│   └── aiService.js           # AI API service for generating learning paths
└── components/
    ├── Header.js              # Application header
    ├── Footer.js              # Application footer
    ├── LearningPathForm.js    # Form for creating new learning paths
    ├── GeneratedPath.js       # Display component for generated paths
    └── SavedPaths.js          # Component for managing saved paths
```

## Features

- **AI-Powered Path Generation**: Uses Google's Gemini AI to create personalized learning paths
- **Firebase Integration**: Secure authentication and real-time data storage
- **Modular Architecture**: Clean separation of concerns with custom hooks and components
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Updates**: Live synchronization of saved learning paths

## Components Overview

### Custom Hooks

- **`useAuth`**: Manages Firebase authentication state and anonymous sign-in
- **`useLearningPaths`**: Handles CRUD operations for learning paths in Firestore

### Services

- **`aiService`**: Encapsulates AI API calls for generating learning paths

### UI Components

- **`Header`**: Displays app title and user information
- **`LearningPathForm`**: Input form for skill, proficiency, and learning preferences
- **`GeneratedPath`**: Shows the AI-generated learning path with save functionality
- **`SavedPaths`**: Lists and manages previously saved learning paths
- **`Footer`**: Simple footer component

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase configuration:
   - Create a Firebase project
   - Configure the global variables: `__app_id`, `__firebase_config`, `__initial_auth_token`

3. Set up AI API:
   - The application uses Google's Gemini AI API
   - API key is provided at runtime through Canvas

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Architecture Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Reusability**: Components and hooks can be easily reused
3. **Maintainability**: Easier to debug and modify specific functionality
4. **Testability**: Individual components and hooks can be tested in isolation
5. **Scalability**: Easy to add new features without affecting existing code

## Technologies Used

- React 18 with Hooks
- Firebase (Auth & Firestore)
- Google Gemini AI API
- Tailwind CSS
- Vite (Build tool)