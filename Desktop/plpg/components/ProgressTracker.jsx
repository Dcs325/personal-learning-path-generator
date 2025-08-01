import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

const ProgressTracker = ({ pathId, userId, learningPath, onProgressUpdate }) => {
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(false);
    const [achievements, setAchievements] = useState([]);

    // Load existing progress from Firebase
    useEffect(() => {
        const loadProgress = async () => {
            if (!pathId || !userId) return;
            
            try {
                const progressRef = doc(db, `artifacts/${appId}/users/${userId}/learningPaths/${pathId}`);
                const progressDoc = await getDoc(progressRef);
                
                if (progressDoc.exists()) {
                    const data = progressDoc.data();
                    setProgress(data.progress || {});
                    setAchievements(data.achievements || []);
                }
            } catch (error) {
                console.error('Error loading progress:', error);
            }
        };

        loadProgress();
    }, [pathId, userId]);

    // Calculate overall progress percentage
    const calculateProgress = () => {
        if (!learningPath || learningPath.length === 0) return 0;
        
        let totalSteps = 0;
        let completedSteps = 0;
        
        learningPath.forEach((module, moduleIndex) => {
            module.subTopics.forEach((_, topicIndex) => {
                totalSteps++;
                const stepKey = `${moduleIndex}-${topicIndex}`;
                if (progress[stepKey]) {
                    completedSteps++;
                }
            });
        });
        
        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    };

    // Handle step completion toggle
    const toggleStepCompletion = async (moduleIndex, topicIndex) => {
        const stepKey = `${moduleIndex}-${topicIndex}`;
        const newProgress = {
            ...progress,
            [stepKey]: !progress[stepKey]
        };
        
        setProgress(newProgress);
        setLoading(true);
        
        try {
            const progressRef = doc(db, `artifacts/${appId}/users/${userId}/learningPaths/${pathId}`);
            await updateDoc(progressRef, {
                progress: newProgress,
                lastUpdated: new Date()
            });
            
            // Check for new achievements
            checkAchievements(newProgress);
            
            if (onProgressUpdate) {
                onProgressUpdate(calculateProgress());
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            // Revert on error
            setProgress(progress);
        } finally {
            setLoading(false);
        }
    };

    // Check and award achievements
    const checkAchievements = async (currentProgress) => {
        const progressPercentage = calculateProgressWithData(currentProgress);
        const newAchievements = [...achievements];
        
        // Define achievement milestones
        const milestones = [
            { id: 'first_step', name: 'First Step', description: 'Complete your first learning step', threshold: 1, icon: '🎯' },
            { id: 'quarter_way', name: 'Quarter Master', description: 'Complete 25% of your learning path', threshold: 25, icon: '🌟' },
            { id: 'halfway_hero', name: 'Halfway Hero', description: 'Complete 50% of your learning path', threshold: 50, icon: '🚀' },
            { id: 'three_quarters', name: 'Almost There', description: 'Complete 75% of your learning path', threshold: 75, icon: '💪' },
            { id: 'completion_champion', name: 'Completion Champion', description: 'Complete 100% of your learning path', threshold: 100, icon: '🏆' }
        ];
        
        milestones.forEach(milestone => {
            if (progressPercentage >= milestone.threshold && !achievements.find(a => a.id === milestone.id)) {
                newAchievements.push({
                    ...milestone,
                    earnedAt: new Date()
                });
            }
        });
        
        if (newAchievements.length > achievements.length) {
            setAchievements(newAchievements);
            
            try {
                const progressRef = doc(db, `artifacts/${appId}/users/${userId}/learningPaths/${pathId}`);
                await updateDoc(progressRef, {
                    achievements: newAchievements
                });
            } catch (error) {
                console.error('Error updating achievements:', error);
            }
        }
    };

    // Helper function to calculate progress with given data
    const calculateProgressWithData = (progressData) => {
        if (!learningPath || learningPath.length === 0) return 0;
        
        let totalSteps = 0;
        let completedSteps = 0;
        
        learningPath.forEach((module, moduleIndex) => {
            module.subTopics.forEach((_, topicIndex) => {
                totalSteps++;
                const stepKey = `${moduleIndex}-${topicIndex}`;
                if (progressData[stepKey]) {
                    completedSteps++;
                }
            });
        });
        
        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    };

    const progressPercentage = calculateProgress();

    return (
        <div className="mt-6 space-y-6">
            {/* Overall Progress Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">Overall Progress</h4>
                    <span className="text-sm font-medium text-indigo-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Achievement Badges */}
            {achievements.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">🏆 Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                        {achievements.map((achievement) => (
                            <div 
                                key={achievement.id}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-md transform hover:scale-105 transition-transform duration-200"
                                title={achievement.description}
                            >
                                {achievement.icon} {achievement.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Learning Path with Checkboxes */}
            <div className="space-y-4">
                {learningPath && learningPath.map((module, moduleIndex) => {
                    const moduleProgress = module.subTopics.filter((_, topicIndex) => {
                        const stepKey = `${moduleIndex}-${topicIndex}`;
                        return progress[stepKey];
                    }).length;
                    const modulePercentage = Math.round((moduleProgress / module.subTopics.length) * 100);

                    return (
                        <div key={moduleIndex} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">{module.moduleTitle}</h4>
                                <span className="text-sm font-medium text-indigo-600">{modulePercentage}%</span>
                            </div>
                            
                            {/* Module Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div 
                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${modulePercentage}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-gray-700 text-sm mb-3">{module.description}</p>
                            
                            {/* Sub-topics with checkboxes */}
                            <ul className="space-y-2">
                                {module.subTopics.map((topic, topicIndex) => {
                                    const stepKey = `${moduleIndex}-${topicIndex}`;
                                    const isCompleted = progress[stepKey];
                                    
                                    return (
                                        <li key={topicIndex} className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleStepCompletion(moduleIndex, topicIndex)}
                                                disabled={loading}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                                    isCompleted 
                                                        ? 'bg-green-500 border-green-500 text-white' 
                                                        : 'border-gray-300 hover:border-indigo-400'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {isCompleted && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <span className={`text-sm ${
                                                isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                                            }`}>
                                                {topic}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            
                            <p className="mt-3 text-xs text-indigo-500 font-medium">
                                Suggested Resource: {module.suggestedResourceType}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressTracker;