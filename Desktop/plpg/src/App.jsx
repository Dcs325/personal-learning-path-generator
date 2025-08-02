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

// Main App Component
function App() {
    const [skill, setSkill] = useState('');
    const [proficiency, setProficiency] = useState('Beginner');
    const [learningStyle, setLearningStyle] = useState([]);
    const [timePerWeek, setTimePerWeek] = useState('4-6');
    const [targetCompletion, setTargetCompletion] = useState('3-months');
    const [difficultyLevel, setDifficultyLevel] = useState('moderate');
    const [learningPreference, setLearningPreference] = useState('hands-on');
    const [generatedPath, setGeneratedPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewingPath, setViewingPath] = useState(null); // For tracking which saved path is being viewed
    const [showAnalytics, setShowAnalytics] = useState(false); // Toggle for analytics view
    const [showChatbot, setShowChatbot] = useState(false); // Toggle for chatbot assistant

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
            setError('');
        }
    };

    // Show a saved path in the generated path section with progress tracking
    const showSavedPath = (pathData) => {
        setSkill(pathData.skill);
        setProficiency(pathData.proficiency);
        setLearningStyle(pathData.learningStyle || []);
        setTimePerWeek(pathData.timePerWeek || '4-6');
        setTargetCompletion(pathData.targetCompletion || '3-months');
        setDifficultyLevel(pathData.difficultyLevel || 'moderate');
        setLearningPreference(pathData.learningPreference || 'hands-on');
        setGeneratedPath(pathData.path);
        setViewingPath(pathData); // Set the full path data for progress tracking
        setShowAnalytics(false); // Hide analytics when viewing a path
        // Scroll to the generated path section
        document.getElementById('generated-path-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Toggle analytics view
    const toggleAnalytics = () => {
        setShowAnalytics(!showAnalytics);
        if (!showAnalytics) {
            // Clear any currently viewed path when showing analytics
            setGeneratedPath(null);
            setViewingPath(null);
        }
    };

    // Handle creating a new path (clear current view)
    const handleNewPath = () => {
        setGeneratedPath(null);
        setViewingPath(null);
        setShowAnalytics(false);
        setSkill('');
        setProficiency('Beginner');
        setLearningStyle([]);
        setTimePerWeek('4-6');
        setTargetCompletion('3-months');
        setDifficultyLevel('moderate');
        setLearningPreference('hands-on');
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
                        onClick={handleNewPath}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            !showAnalytics && !viewingPath 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        ➕ Create New Path
                    </button>
                    <button
                        onClick={toggleAnalytics}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            showAnalytics 
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
                {showAnalytics ? (
                    <LearningAnalytics userId={userId} isAuthReady={isAuthReady} />
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
                            setLearningPreference={setLearningPreference}
                            onGenerate={handleGenerateLearningPath}
                            loading={loading}
                            error={displayError}
                        />

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
                        />

                        <SavedPaths
                            savedPaths={savedPaths}
                            onView={showSavedPath}
                            onDelete={deletePath}
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
                />
            )}
        </div>
    );
}

export default App;