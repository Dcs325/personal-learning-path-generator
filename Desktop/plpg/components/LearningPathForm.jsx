import React from 'react';

const LearningPathForm = ({
    skill,
    setSkill,
    proficiency,
    setProficiency,
    learningStyle,
    handleLearningStyleChange,
    timePerWeek,
    setTimePerWeek,
    targetCompletion,
    setTargetCompletion,
    difficultyLevel,
    setDifficultyLevel,
    learningPreference,
    handleLearningPreferenceChange,
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

    const learningPreferences = [
        { value: 'visual', label: '👁️ Visual', description: 'Charts, diagrams, infographics' },
        { value: 'auditory', label: '🎧 Auditory', description: 'Podcasts, lectures, discussions' },
        { value: 'hands-on', label: '🛠️ Hands-on', description: 'Projects, labs, practice exercises' },
        { value: 'reading', label: '📚 Reading/Writing', description: 'Articles, documentation, notes' }
    ];

    return (
        <section className="mb-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Generate a New Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div>
                    <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        🎚️ Difficulty Adjustment
                    </label>
                    <select
                        id="difficultyLevel"
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                    >
                        <option value="gentle">Gentle Pace</option>
                        <option value="moderate">Moderate Challenge</option>
                        <option value="intensive">Intensive Learning</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="timePerWeek" className="block text-sm font-medium text-gray-700 mb-1">
                        ⏱️ Available Time per Week
                    </label>
                    <select
                        id="timePerWeek"
                        value={timePerWeek}
                        onChange={(e) => setTimePerWeek(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                    >
                        <option value="1-3">1-3 hours/week</option>
                        <option value="4-6">4-6 hours/week</option>
                        <option value="7-10">7-10 hours/week</option>
                        <option value="11-15">11-15 hours/week</option>
                        <option value="16+">16+ hours/week</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="targetCompletion" className="block text-sm font-medium text-gray-700 mb-1">
                        📅 Target Completion
                    </label>
                    <select
                        id="targetCompletion"
                        value={targetCompletion}
                        onChange={(e) => setTargetCompletion(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                    >
                        <option value="1-month">1 Month</option>
                        <option value="2-months">2 Months</option>
                        <option value="3-months">3 Months</option>
                        <option value="6-months">6 Months</option>
                        <option value="flexible">Flexible Timeline</option>
                    </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        🧠 Learning Style Preferences (Select Multiple)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {learningPreferences.map(pref => (
                            <label key={pref.value} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200">
                                <input
                                    type="checkbox"
                                    value={pref.value}
                                    checked={learningPreference.includes(pref.value)}
                                    onChange={handleLearningPreferenceChange}
                                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                />
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                                    <div className="text-xs text-gray-500">{pref.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Types (Select Multiple)
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {learningStyles.map(style => (
                            <label key={style} className="inline-flex items-center cursor-pointer bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition duration-200">
                                <input
                                    type="checkbox"
                                    value={style}
                                    checked={learningStyle.includes(style)}
                                    onChange={handleLearningStyleChange}
                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 transition duration-200"
                                />
                                <span className="ml-2 text-sm text-gray-700">{style}</span>
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