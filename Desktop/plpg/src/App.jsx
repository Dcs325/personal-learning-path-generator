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

// Main App Component
function App() {
    const [skill, setSkill] = useState('');
    const [proficiency, setProficiency] = useState('Beginner');
    const [learningStyle, setLearningStyle] = useState([]);
    const [generatedPath, setGeneratedPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const path = await generateLearningPath(skill, proficiency, learningStyle);
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
        const success = await savePath(skill, proficiency, learningStyle, generatedPath);
        if (success) {
            setGeneratedPath(null);
            setError('');
        }
    };

    // Show a saved path in the generated path section
    const showSavedPath = (pathData) => {
        setSkill(pathData.skill);
        setProficiency(pathData.proficiency);
        setLearningStyle(pathData.learningStyle || []);
        setGeneratedPath(pathData.path);
        // Scroll to the generated path section
        document.getElementById('generated-path-section')?.scrollIntoView({ behavior: 'smooth' });
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
                <LearningPathForm
                    skill={skill}
                    setSkill={setSkill}
                    proficiency={proficiency}
                    setProficiency={setProficiency}
                    learningStyle={learningStyle}
                    handleLearningStyleChange={handleLearningStyleChange}
                    onGenerate={handleGenerateLearningPath}
                    loading={loading}
                    error={displayError}
                />

                <GeneratedPath
                    generatedPath={generatedPath}
                    skill={skill}
                    proficiency={proficiency}
                    learningStyle={learningStyle}
                    onSave={handleSavePath}
                />

                <SavedPaths
                    savedPaths={savedPaths}
                    onView={showSavedPath}
                    onDelete={deletePath}
                />
            </main>

            <Footer />
        </div>
    );
}

export default App;