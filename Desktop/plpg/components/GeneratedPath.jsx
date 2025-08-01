import React from 'react';
import ProgressTracker from './ProgressTracker';

const GeneratedPath = ({ generatedPath, skill, proficiency, learningStyle, onSave, savedPathId, userId, showProgress = false }) => {
    if (!generatedPath) return null;

    return (
        <section id="generated-path-section" className="mt-10 pt-8 border-t border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Your Personalized Learning Path</h2>
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
                            <li key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{module.moduleTitle}</h4>
                                <p className="text-gray-700 text-sm mb-2">{module.description}</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                                    {module.subTopics.map((topic, subIndex) => (
                                        <li key={subIndex}>{topic}</li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-xs text-indigo-500 font-medium">
                                    Suggested Resource: {module.suggestedResourceType}
                                </p>
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
        </section>
    );
};

export default GeneratedPath;