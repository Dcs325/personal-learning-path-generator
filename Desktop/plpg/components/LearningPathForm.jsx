import React from 'react';

const LearningPathForm = ({
    skill,
    setSkill,
    proficiency,
    setProficiency,
    learningStyle,
    handleLearningStyleChange,
    onGenerate,
    loading,
    error
}) => {
    const learningStyles = [
        'Video Tutorials',
        'Text-based Articles',
        'Hands-on Projects',
        'Interactive Exercises',
        'Official Documentation'
    ];

    return (
        <section className="mb-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Generate a New Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Skill
                    </label>
                    <input
                        type="text"
                        id="skill"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="e.g., Data Science with Python"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    />
                </div>

                <div>
                    <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Proficiency
                    </label>
                    <select
                        id="proficiency"
                        value={proficiency}
                        onChange={(e) => setProficiency(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Learning Style
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {learningStyles.map(style => (
                            <label key={style} className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={style}
                                    checked={learningStyle.includes(style)}
                                    onChange={handleLearningStyleChange}
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-200"
                                />
                                <span className="ml-2 text-gray-700">{style}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    {error}
                </div>
            )}

            <button
                onClick={onGenerate}
                disabled={loading}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Path...
                    </>
                ) : (
                    'Generate Learning Path'
                )}
            </button>
        </section>
    );
};

export default LearningPathForm;