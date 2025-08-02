import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLearningPaths } from '../hooks/useLearningPaths';
import { generateLearningPath } from '../services/aiService';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LearningPathForm from '../components/LearningPathForm.jsx';
import GeneratedPath from '../components/GeneratedPath.jsx';
import SavedPaths from '../components/SavedPaths.jsx';
import AuthForm from '../components/AuthForm.jsx';
import EmailVerification from '../components/EmailVerification.jsx';
import LearningAnalytics from '../components/LearningAnalytics.jsx';
import ChatbotAssistant from '../components/ChatbotAssistant.jsx';
import AICharacter from '../components/AICharacter.jsx';

// Main App Component
function App() {
    const [skill, setSkill] = useState('');
    const [proficiency, setProficiency] = useState('Beginner');
    const [learningStyle, setLearningStyle] = useState([]);
    const [timePerWeek, setTimePerWeek] = useState('4-6');
    const [targetCompletion, setTargetCompletion] = useState('3-months');
    const [difficultyLevel, setDifficultyLevel] = useState('moderate');
    const [learningPreference, setLearningPreference] = useState(['hands-on']);
    const [generatedPath, setGeneratedPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewingPath, setViewingPath] = useState(null); // For tracking which saved path is being viewed
    const [currentView, setCurrentView] = useState('home'); // Track current view: 'home', 'generated-path', 'analytics'
    const [showChatbot, setShowChatbot] = useState(false); // Toggle for chatbot assistant
    const [showAICharacter, setShowAICharacter] = useState(true); // Toggle for AI character
    const [characterEncouragement, setCharacterEncouragement] = useState(null); // Trigger for character encouragement

    // Custom hooks for authentication and learning paths
    const { user, userId, isAuthReady, authError, emailVerified } = useAuth();
    const { savedPaths, pathError, savePath, deletePath } = useLearningPaths(userId, isAuthReady);

    // Combine errors from different sources
    const displayError = error || authError || pathError;

    // Handle learning style checkbox changes
    const handleLearningStyleChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setLearningStyle([...learningStyle, value]);
        } else {
            setLearningStyle(learningStyle.filter(style => style !== value));
        }
    };

    // Handle learning preference checkbox changes
    const handleLearningPreferenceChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setLearningPreference([...learningPreference, value]);
        } else {
            setLearningPreference(learningPreference.filter(pref => pref !== value));
        }
    };

    // Trigger AI character encouragement
    const triggerCharacterEncouragement = (type) => {
        setCharacterEncouragement(type);
        // Clear the trigger after a short delay to allow for re-triggering
        setTimeout(() => setCharacterEncouragement(null), 1000);
    };

    // Generate learning path using AI service
    const handleGenerateLearningPath = async () => {
        if (!skill.trim()) {
            setError("Please enter a target skill.");
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedPath(null);

        try {
            const path = await generateLearningPath(
                skill, 
                proficiency, 
                learningStyle, 
                timePerWeek, 
                targetCompletion, 
                difficultyLevel, 
                learningPreference
            );
            setGeneratedPath(path);
            setCurrentView('generated-path'); // Navigate to generated path view
            triggerCharacterEncouragement('study_start');
        } catch (err) {
            console.error("Error generating learning path:", err);
            setError(`Failed to generate path: ${err.message || 'Network error'}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Handle saving path
    const handleSavePath = async () => {
        const success = await savePath(
            skill, 
            proficiency, 
            learningStyle, 
            timePerWeek, 
            targetCompletion, 
            difficultyLevel, 
            learningPreference, 
            generatedPath
        );
        if (success) {
            setGeneratedPath(null);
            setCurrentView('home'); // Navigate back to home after saving
            setError('');
            triggerCharacterEncouragement('achievement');
        }
    };

    // Navigation functions
    const navigateToHome = () => {
        setCurrentView('home');
        setGeneratedPath(null);
        setViewingPath(null);
    };

    const navigateToAnalytics = () => {
        setCurrentView('analytics');
    };

    // Show a saved path in the generated path section with progress tracking
    const showSavedPath = (pathData) => {
        setSkill(pathData.skill);
        setProficiency(pathData.proficiency);
        setLearningStyle(pathData.learningStyle || []);
        setTimePerWeek(pathData.timePerWeek || '4-6');
        setTargetCompletion(pathData.targetCompletion || '3-months');
        setDifficultyLevel(pathData.difficultyLevel || 'moderate');
        setLearningPreference(Array.isArray(pathData.learningPreference) ? pathData.learningPreference : [pathData.learningPreference || 'hands-on']);
        setGeneratedPath(pathData.path);
        setViewingPath(pathData); // Set the full path data for progress tracking
        setCurrentView('generated-path'); // Navigate to generated path view
    };

    // Handle creating a new path (clear current view)
    const handleNewPath = () => {
        setCurrentView('home');
        setGeneratedPath(null);
        setViewingPath(null);
        setSkill('');
        setProficiency('Beginner');
        setLearningStyle([]);
        setTimePerWeek('4-6');
        setTargetCompletion('3-months');
        setDifficultyLevel('moderate');
        setLearningPreference(['hands-on']);
        setError('');
    };

    // Show authentication form if user is not logged in
    if (!user) {
        return <AuthForm />;
    }

    // Show email verification if user is logged in but email not verified
    if (user && !emailVerified) {
        return <EmailVerification />;
    }

    // Main UI Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-sans text-gray-800 p-4 sm:p-6">
            <Header />

            <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-indigo-200">
                {/* Navigation Buttons */}
                <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-indigo-200">
                    <button
                        onClick={navigateToHome}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentView === 'home' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        ➕ Create New Path
                    </button>
                    <button
                        onClick={navigateToAnalytics}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentView === 'analytics' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        📈 Analytics Dashboard
                    </button>
                    <button
                        onClick={() => setShowChatbot(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                    >
                        🤖 Ask Assistant
                    </button>
                    {viewingPath && (
                        <div className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                            <span className="text-sm font-medium">📚 Viewing: {viewingPath.skill}</span>
                        </div>
                    )}
                </div>

                {/* Conditional Content Rendering */}
                {currentView === 'analytics' ? (
                    <LearningAnalytics userId={userId} isAuthReady={isAuthReady} />
                ) : currentView === 'generated-path' ? (
                    <>
                        {/* Back to Home Button */}
                        <div className="mb-6">
                            <button
                                onClick={navigateToHome}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
                            >
                                ← Back to Home
                            </button>
                        </div>
                        
                        <GeneratedPath
                            generatedPath={generatedPath}
                            skill={skill}
                            proficiency={proficiency}
                            learningStyle={learningStyle}
                            timePerWeek={timePerWeek}
                            targetCompletion={targetCompletion}
                            difficultyLevel={difficultyLevel}
                            learningPreference={learningPreference}
                            onSave={handleSavePath}
                            savedPathId={viewingPath?.id}
                            userId={userId}
                            showProgress={!!viewingPath}
                            onEncouragement={triggerCharacterEncouragement}
                        />
                    </>
                ) : (
                    <>
                        <LearningPathForm
                            skill={skill}
                            setSkill={setSkill}
                            proficiency={proficiency}
                            setProficiency={setProficiency}
                            learningStyle={learningStyle}
                            handleLearningStyleChange={handleLearningStyleChange}
                            timePerWeek={timePerWeek}
                            setTimePerWeek={setTimePerWeek}
                            targetCompletion={targetCompletion}
                            setTargetCompletion={setTargetCompletion}
                            difficultyLevel={difficultyLevel}
                            setDifficultyLevel={setDifficultyLevel}
                            learningPreference={learningPreference}
                            handleLearningPreferenceChange={handleLearningPreferenceChange}
                            onGenerate={handleGenerateLearningPath}
                            loading={loading}
                            error={displayError}
                        />

                        <SavedPaths
                            savedPaths={savedPaths}
                            onView={showSavedPath}
                            onDelete={deletePath}
                            onEncouragement={triggerCharacterEncouragement}
                        />
                    </>
                )}
            </main>

            <Footer />
            
            {/* Chatbot Assistant */}
             {showChatbot && (
                 <ChatbotAssistant 
                     isOpen={showChatbot}
                     onClose={() => setShowChatbot(false)}
                     currentPath={viewingPath || (generatedPath ? { skill, proficiency, generatedPath } : null)}
                     user={user}
                 />
             )}
             
             {/* AI Character Assistant */}
             {user && emailVerified && (
                 <AICharacter 
                     isVisible={showAICharacter}
                     encouragementTrigger={characterEncouragement}
                     userProgress={{
                         currentSkill: skill,
                         proficiency: proficiency,
                         hasGeneratedPath: !!generatedPath,
                         hasSavedPaths: savedPaths.length > 0,
                         isViewingPath: !!viewingPath
                     }}
                     onInteraction={(type) => triggerCharacterEncouragement(type)}
                 />
             )}
        </div>
    );
}

export default App;