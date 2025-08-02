import React, { useState } from 'react';
import ProgressTracker from './ProgressTracker';
import ExportUtils from './ExportUtils';
import StudyToolkit from './StudyToolkit';

const GeneratedPath = ({ generatedPath, skill, proficiency, learningStyle, timePerWeek, targetCompletion, difficultyLevel, learningPreference, onSave, savedPathId, userId, showProgress = false }) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [showStudyToolkit, setShowStudyToolkit] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    
    const handleOpenStudyToolkit = (module) => {
        setSelectedModule(module);
        setShowStudyToolkit(true);
    };
    
    if (!generatedPath) return null;

    const pathData = {
        skill,
        proficiency,
        learningStyle,
        timePerWeek,
        targetCompletion,
        difficultyLevel,
        learningPreference
    };

    return (
        <section id="generated-path-section" className="mt-10 pt-8 border-t border-indigo-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-indigo-700">Your Personalized Learning Path</h2>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
                >
                    <span>💾</span>
                    <span>Export</span>
                </button>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg shadow-inner border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">{skill} - {proficiency}</h3>
                {learningStyle.length > 0 && (
                    <p className="text-sm text-gray-600 mb-4">Preferred Styles: {learningStyle.join(', ')}</p>
                )}
                
                {/* Show progress tracker if this is a saved path */}
                {showProgress && savedPathId && userId ? (
                    <ProgressTracker 
                        pathId={savedPathId}
                        userId={userId}
                        learningPath={generatedPath}
                    />
                ) : (
                    /* Show static view for unsaved paths */
                    <ol className="list-decimal list-inside space-y-6">
                        {generatedPath.map((module, index) => (
                            <li key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-lg font-semibold text-gray-900">{module.moduleTitle}</h4>
                                    <div className="flex items-center space-x-2">
                                        {module.estimatedHours && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                ⏱️ {module.estimatedHours}h
                                            </span>
                                        )}
                                        {module.difficultyRating && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                                🎚️ {module.difficultyRating}/5
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleOpenStudyToolkit(module)}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-1"
                                        >
                                            <span>📚</span>
                                            <span>Study Tools</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 text-sm mb-3">{module.description}</p>
                                
                                {/* Weekly Schedule */}
                                {module.weeklySchedule && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                        <h5 className="text-sm font-medium text-green-800 mb-1">📅 Weekly Schedule</h5>
                                        <p className="text-sm text-green-700">{module.weeklySchedule}</p>
                                    </div>
                                )}
                                
                                {/* Sub Topics */}
                                <div className="mb-3">
                                    <h5 className="text-sm font-medium text-gray-800 mb-2">📚 Topics to Cover:</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                                        {module.subTopics.map((topic, subIndex) => (
                                            <li key={subIndex}>{topic}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Recommended Books */}
                                {module.recommendedBooks && module.recommendedBooks.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <h5 className="text-sm font-medium text-blue-800 mb-2">📚 Recommended Books:</h5>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            {module.recommendedBooks.map((book, bookIndex) => (
                                                <li key={bookIndex} className="flex items-start">
                                                    <span className="text-blue-500 mr-2">•</span>
                                                    <span><strong>{book.title}</strong> by {book.author}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Recommended Courses */}
                                {module.recommendedCourses && module.recommendedCourses.length > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                                        <h5 className="text-sm font-medium text-orange-800 mb-2">🎓 Recommended Courses:</h5>
                                        <ul className="text-sm text-orange-700 space-y-1">
                                            {module.recommendedCourses.map((course, courseIndex) => (
                                                <li key={courseIndex} className="flex items-start">
                                                    <span className="text-orange-500 mr-2">•</span>
                                                    <span><strong>{course.title}</strong> on {course.platform}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Learning Tips */}
                                {module.learningTips && module.learningTips.length > 0 && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                                        <h5 className="text-sm font-medium text-purple-800 mb-2">💡 Learning Tips:</h5>
                                        <ul className="text-sm text-purple-700 space-y-1">
                                            {module.learningTips.map((tip, tipIndex) => (
                                                <li key={tipIndex} className="flex items-start">
                                                    <span className="text-purple-500 mr-2">•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Resource Type */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-indigo-500 font-medium">
                                        🎯 Suggested Resource: {module.suggestedResourceType}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
                
                {/* Save button only for unsaved paths */}
                {!showProgress && (
                    <button
                        onClick={onSave}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save This Path
                    </button>
                )}
            </div>
            
            {/* Export Modal */}
            {showExportModal && (
                <ExportUtils
                    learningPath={generatedPath}
                    pathData={pathData}
                    onClose={() => setShowExportModal(false)}
                />
            )}
            
            {/* Study Toolkit Modal */}
             {showStudyToolkit && selectedModule && (
                 <StudyToolkit
                     isOpen={showStudyToolkit}
                     module={selectedModule}
                     userId={userId}
                     onClose={() => setShowStudyToolkit(false)}
                 />
             )}
        </section>
    );
};

export default GeneratedPath;