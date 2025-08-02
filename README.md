# Personalized Learning Path Generator

An AI-powered React application that generates personalized learning paths with comprehensive progress tracking, achievement systems, and analytics dashboard. Built with Firebase for secure authentication and real-time data persistence.

## Project Structure

The application has been modularized into the following structure:

```
├── src/
│   ├── App.jsx                # Main App component with navigation
│   └── main.jsx               # Application entry point
├── components/
│   ├── AuthForm.jsx           # User authentication form
│   ├── EmailVerification.jsx  # Email verification component
│   ├── Header.jsx             # Application header with user info
│   ├── Footer.jsx             # Application footer
│   ├── LearningPathForm.jsx   # Form for creating new learning paths
│   ├── GeneratedPath.jsx      # Display component with progress tracking
│   ├── SavedPaths.jsx         # Enhanced saved paths with progress bars
│   ├── ProgressTracker.jsx    # Interactive progress tracking component
│   └── LearningAnalytics.jsx  # Analytics dashboard component
├── hooks/
│   ├── useAuth.js             # Authentication with email/password
│   └── useLearningPaths.js    # Learning paths management hook
├── services/
│   └── aiService.js           # Google Gemini AI service
├── config/
│   └── firebase.js            # Firebase configuration
├── package.json               # Dependencies and scripts
├── .env.local                 # Environment variables
├── FIREBASE_AUTH_SETUP.md     # Firebase setup guide
└── GOOGLE_AI_SETUP.md         # Google AI API setup guide
```

## Features

### 🤖 **AI-Powered Learning**
- **Smart Path Generation**: Uses Google's Gemini AI to create personalized learning paths
- **Adaptive Content**: Tailored to skill level, proficiency, and learning style preferences
- **Structured Learning**: Organized modules with sub-topics and resource recommendations

### 📊 **Progress Tracking & Analytics**
- **Interactive Checkboxes**: Mark completion for each learning step
- **Real-time Progress Bars**: Visual progress tracking for modules and overall completion
- **Achievement System**: Earn badges for reaching learning milestones
- **Analytics Dashboard**: Comprehensive learning statistics and insights
- **Learning Streak**: Track active learning days and momentum
- **Progress Persistence**: All progress automatically saved to Firebase

### 🏆 **Achievement System**
- 🎯 **First Step**: Complete your first learning step
- 🌟 **Quarter Master**: Reach 25% completion
- 🚀 **Halfway Hero**: Achieve 50% progress
- 💪 **Almost There**: Complete 75% of your path
- 🏆 **Completion Champion**: Finish 100% of your learning path

### 🔐 **Authentication & Security**
- **Email/Password Authentication**: Secure user accounts with Firebase Auth
- **Email Verification**: Verified accounts for enhanced security
- **Protected Routes**: Learning paths tied to authenticated users
- **Real-time Sync**: Data synchronized across devices

### 🎨 **User Experience**
- **Responsive Design**: Modern UI with Tailwind CSS
- **Intuitive Navigation**: Easy switching between create, view, and analytics modes
- **Smart Status Indicators**: Visual badges for path completion status
- **Seamless Interactions**: Smooth transitions and real-time updates

## Components Overview

### 🎣 **Custom Hooks**

- **`useAuth`**: Manages Firebase authentication with email/password and email verification
- **`useLearningPaths`**: Handles CRUD operations for learning paths with progress tracking in Firestore

### 🔧 **Services**

- **`aiService`**: Google Gemini AI integration for generating personalized learning paths

### 🧩 **Core UI Components**

- **`App`**: Main application component with navigation and state management
- **`Header`**: Application header with user info and logout functionality
- **`Footer`**: Simple footer component

### 🔐 **Authentication Components**

- **`AuthForm`**: User registration and login with email/password
- **`EmailVerification`**: Email verification flow with resend functionality

### 📚 **Learning Path Components**

- **`LearningPathForm`**: Input form for skill, proficiency, and learning style preferences
- **`GeneratedPath`**: Displays AI-generated paths with conditional progress tracking
- **`SavedPaths`**: Enhanced list with progress bars, status badges, and achievement counts

### 📊 **Progress & Analytics Components**

- **`ProgressTracker`**: Interactive progress tracking with checkboxes, progress bars, and achievements
- **`LearningAnalytics`**: Comprehensive analytics dashboard with learning statistics and insights

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication in Authentication > Sign-in method
   - Create a Firestore database
   - Copy your Firebase config to `config/firebase.js`
   - See `FIREBASE_AUTH_SETUP.md` for detailed instructions

3. **Set up Google AI API:**
   - Get an API key from [Google AI Studio](https://aistudio.google.com/)
   - Add your API key to `.env.local`:
   ```
   VITE_GOOGLE_AI_API_KEY=your_api_key_here
   ```
   - See `GOOGLE_AI_SETUP.md` for detailed instructions

4. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual API keys
   ```

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

## How to Use

### 🚀 **Getting Started**
1. **Sign up** with email and password
2. **Verify your email** through the verification link
3. **Create your first learning path** by filling out the form
4. **Generate** a personalized path using AI
5. **Save** the path to start tracking progress

### 📊 **Progress Tracking**
1. **Click "Continue"** on any saved path to start tracking
2. **Check off completed steps** to see progress bars fill up
3. **Earn achievement badges** as you reach milestones
4. **View Analytics Dashboard** to see your learning statistics
5. **Track your learning streak** and overall progress

### 🏆 **Achievement System**
- Complete steps to earn badges automatically
- View all achievements in the analytics dashboard
- Track your learning momentum with the streak counter

## Technologies Used

- **React 18** with Hooks and modern patterns
- **Firebase** (Authentication, Firestore, Real-time updates)
- **Google Gemini AI API** for intelligent path generation
- **Tailwind CSS** for responsive design
- **Vite** for fast development and building
- **JavaScript ES6+** with modern syntax# Force redeploy

# Force rebuild Sat Aug  2 13:33:42 EDT 2025
