import React, { useState } from 'react';
import ExportUtils from './ExportUtils';
import StudyToolkit from './StudyToolkit';

const SavedPaths = ({ savedPaths, onView, onDelete, onEncouragement }) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedPath, setSelectedPath] = useState(null);
    const [showStudyToolkit, setShowStudyToolkit] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);

    const handleExport = (path) => {
        setSelectedPath(path);
        setShowExportModal(true);
    };
    
    const handleOpenStudyToolkit = (module) => {
        setSelectedModule(module);
        setShowStudyToolkit(true);
    };
    // Calculate progress for a path
    const calculateProgress = (path) => {
        if (!path.path || !Array.isArray(path.path)) return 0;
        
        let totalSteps = 0;
        let completedSteps = 0;
        
        path.path.forEach((module, moduleIndex) => {
            if (module.subTopics && Array.isArray(module.subTopics)) {
                module.subTopics.forEach((_, topicIndex) => {
                    totalSteps++;
                    const stepKey = `${moduleIndex}-${topicIndex}`;
                    if (path.progress && path.progress[stepKey]) {
                        completedSteps++;
                    }
                });
            }
        });
        
        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    };

    // Get status badge based on progress
    const getStatusBadge = (progress) => {
        if (progress === 100) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Completed</span>;
        } else if (progress > 0) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">📚 In Progress</span>;
        } else {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">⏳ Not Started</span>;
        }
    };

    // Get achievement count
    const getAchievementCount = (path) => {
        return path.achievements ? path.achievements.length : 0;
    };

    return (
        <section className="mt-10 pt-8 border-t border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Your Saved Paths</h2>
            {savedPaths.length === 0 ? (
                <p className="text-gray-600">No saved paths yet. Generate one above!</p>
            ) : (
                <ul className="space-y-4">
                    {savedPaths.map((path) => {
                        const progress = calculateProgress(path);
                        const achievementCount = getAchievementCount(path);
                        
                        return (
                            <li key={path.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{path.skill}</h3>
                                            {getStatusBadge(progress)}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-1">Proficiency: {path.proficiency}</p>
                                        
                                        {path.learningStyle && path.learningStyle.length > 0 && (
                                            <p className="text-xs text-gray-500 mb-2">Styles: {path.learningStyle.join(', ')}</p>
                                        )}
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        progress === 100 ? 'bg-green-500' :
                                                        progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Achievements and Last Updated */}
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-4">
                                                <span>Saved: {path.createdAt?.toDate().toLocaleString() || 'N/A'}</span>
                                                {path.lastUpdated && (
                                                    <span>Updated: {path.lastUpdated.toDate().toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            {achievementCount > 0 && (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    🏆 {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 mt-3 sm:mt-0 sm:ml-4">
                        <button
                            onClick={() => onView(path)}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                        >
                            {progress > 0 ? 'Continue' : 'View'}
                        </button>
                        <button
                             onClick={() => handleExport(path)}
                             className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                         >
                             💾 Export
                         </button>
                        <button
                            onClick={() => onDelete(path.id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                        >
                            Delete
                        </button>
                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            
            {/* Export Modal */}
            {showExportModal && selectedPath && (
                <ExportUtils
                    learningPath={selectedPath.generatedPath}
                    pathData={{
                        skill: selectedPath.skill,
                        proficiency: selectedPath.proficiency,
                        learningStyle: selectedPath.learningStyle,
                        timePerWeek: selectedPath.timePerWeek,
                        targetCompletion: selectedPath.targetCompletion,
                        difficultyLevel: selectedPath.difficultyLevel,
                        learningPreference: selectedPath.learningPreference
                    }}
                    onClose={() => {
                        setShowExportModal(false);
                        setSelectedPath(null);
                    }}
                />
            )}
            
            {/* Study Toolkit Modal */}
            {showStudyToolkit && selectedModule && (
                <StudyToolkit
                    isOpen={showStudyToolkit}
                    module={selectedModule}
                    userId={savedPaths[0]?.userId} // Get userId from first saved path
                    onClose={() => {
                        setShowStudyToolkit(false);
                        setSelectedModule(null);
                    }}
                    onEncouragement={onEncouragement}
                />
            )}
        </section>
    );
};

export default SavedPaths;