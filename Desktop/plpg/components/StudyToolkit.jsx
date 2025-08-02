import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ResourceIntegration from './ResourceIntegration';

const StudyToolkit = ({ isOpen, onClose, module, userId, onEncouragement }) => {
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [integratedResources, setIntegratedResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load saved data when component opens
    useEffect(() => {
        if (isOpen && module && userId) {
            loadStudyData();
        }
    }, [isOpen, module, userId]);

    const loadStudyData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'studyData', `${userId}_${module.moduleTitle}`);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNotes(data.notes || '');
                setFlashcards(data.flashcards || []);
                setQuizzes(data.quizzes || []);
                setIntegratedResources(data.integratedResources || []);
            }
        } catch (error) {
            console.error('Error loading study data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveStudyData = async () => {
        if (!userId || !module) return;
        
        setSaving(true);
        try {
            const docRef = doc(db, 'studyData', `${userId}_${module.moduleTitle}`);
            await setDoc(docRef, {
                moduleTitle: module.moduleTitle,
                notes,
                flashcards,
                quizzes,
                integratedResources,
                lastUpdated: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving study data:', error);
        } finally {
            setSaving(false);
        }
    };

    // Auto-save when data changes
    useEffect(() => {
        if (notes || flashcards.length > 0 || quizzes.length > 0 || integratedResources.length > 0) {
            const timeoutId = setTimeout(saveStudyData, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [notes, flashcards, quizzes, integratedResources]);

    // Auto-generate quiz when quiz tab is accessed for the first time
    useEffect(() => {
        if (activeTab === 'quiz' && quizzes.length === 0 && module && !loading) {
            // Small delay to ensure smooth UI transition
            const timeoutId = setTimeout(() => {
                generateAutoQuizzes();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [activeTab, quizzes.length, module, loading]);

    // Trigger encouragement for note-taking
    useEffect(() => {
        if (notes.length > 50 && activeTab === 'notes') {
            const timeoutId = setTimeout(() => {
                onEncouragement && onEncouragement('note_taking');
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [notes, activeTab]);

    const addFlashcard = () => {
        setFlashcards([...flashcards, {
            id: Date.now(),
            front: '',
            back: '',
            difficulty: 'medium'
        }]);
        onEncouragement && onEncouragement('flashcard_review');
    };

    const updateFlashcard = (id, field, value) => {
        setFlashcards(flashcards.map(card => 
            card.id === id ? { ...card, [field]: value } : card
        ));
    };

    const deleteFlashcard = (id) => {
        setFlashcards(flashcards.filter(card => card.id !== id));
    };

    const addQuiz = () => {
        setQuizzes([...quizzes, {
            id: Date.now(),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
        }]);
        onEncouragement && onEncouragement('quiz_complete');
    };

    const updateQuiz = (id, field, value) => {
        setQuizzes(quizzes.map(quiz => 
            quiz.id === id ? { ...quiz, [field]: value } : quiz
        ));
    };

    const updateQuizOption = (quizId, optionIndex, value) => {
        setQuizzes(quizzes.map(quiz => {
            if (quiz.id === quizId) {
                const newOptions = [...quiz.options];
                newOptions[optionIndex] = value;
                return { ...quiz, options: newOptions };
            }
            return quiz;
        }));
    };

    const deleteQuiz = (id) => {
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    };

    const generateAutoQuizzes = () => {
        if (!module) return;
        
        const generatedQuizzes = [];
        
        // Generate questions based on module content
        if (module.subTopics && module.subTopics.length > 0) {
            module.subTopics.slice(0, 3).forEach((topic, index) => {
                const questionTemplates = [
                    `What is the main concept behind ${topic}?`,
                    `Which of the following best describes ${topic}?`,
                    `What is the primary purpose of ${topic}?`,
                    `How does ${topic} relate to ${module.moduleTitle}?`
                ];
                
                const optionTemplates = [
                    [`A fundamental concept in ${module.moduleTitle}`, `An advanced technique`, `A basic principle`, `A complex algorithm`],
                    [`Primary implementation`, `Secondary consideration`, `Optional feature`, `Deprecated method`],
                    [`Core functionality`, `Helper utility`, `Debug tool`, `Legacy component`]
                ];
                
                generatedQuizzes.push({
                    id: Date.now() + index,
                    question: questionTemplates[index % questionTemplates.length],
                    options: optionTemplates[index % optionTemplates.length],
                    correctAnswer: 0,
                    explanation: `This question tests your understanding of ${topic} within the context of ${module.moduleTitle}.`
                });
            });
        } else {
            // Fallback questions based on module title
            const fallbackQuestions = [
                {
                    id: Date.now(),
                    question: `What is the main focus of ${module.moduleTitle}?`,
                    options: [
                        `Understanding core concepts and principles`,
                        `Memorizing specific syntax`,
                        `Learning advanced techniques only`,
                        `Focusing on theoretical aspects`
                    ],
                    correctAnswer: 0,
                    explanation: `This module focuses on building a solid foundation in ${module.moduleTitle}.`
                },
                {
                    id: Date.now() + 1,
                    question: `Which approach is most effective when learning ${module.moduleTitle}?`,
                    options: [
                        `Combining theory with practical application`,
                        `Only reading documentation`,
                        `Skipping fundamentals`,
                        `Avoiding hands-on practice`
                    ],
                    correctAnswer: 0,
                    explanation: `The best learning approach combines theoretical understanding with practical application.`
                }
            ];
            generatedQuizzes.push(...fallbackQuestions);
        }
        
        setQuizzes(generatedQuizzes);
        onEncouragement && onEncouragement('quiz_complete');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">📚 Study Toolkit</h2>
                        <p className="text-sm text-indigo-600 font-medium">
                            {module?.moduleTitle || 'Learning Module'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {saving && (
                            <div className="flex items-center text-green-600 text-sm">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                Saving...
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-white"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'notes', label: '📝 Notes', icon: '📝' },
                        { id: 'flashcards', label: '🃏 Flashcards', icon: '🃏' },
                        { id: 'quiz', label: '🧠 Quiz', icon: '🧠' },
                        { id: 'resources', label: '📚 Resources', icon: '📚' },
                        { id: 'mindmap', label: '🗺️ Mind Map', icon: '🗺️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-gray-600">Loading study data...</span>
                        </div>
                    ) : (
                        <>
                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">📝 Module Notes</h3>
                                        <div className="text-sm text-gray-500">
                                            {notes.length} characters
                                        </div>
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Write your notes for this module here...\n\n• Key concepts\n• Important points\n• Questions to review\n• Personal insights"
                                        className="w-full h-96 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    />
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            💡 <strong>Tip:</strong> Use bullet points, headings, and organize your thoughts. 
                                            Your notes are automatically saved as you type!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Flashcards Tab */}
                            {activeTab === 'flashcards' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">🃏 Flashcards</h3>
                                        <button
                                            onClick={addFlashcard}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                        >
                                            <span>➕</span>
                                            <span>Add Flashcard</span>
                                        </button>
                                    </div>
                                    
                                    {flashcards.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="text-6xl mb-4">🃏</div>
                                            <p className="text-lg mb-2">No flashcards yet</p>
                                            <p className="text-sm">Create flashcards to help memorize key concepts</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {flashcards.map((card, index) => (
                                                <div key={card.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium text-gray-600">Card {index + 1}</span>
                                                        <button
                                                            onClick={() => deleteFlashcard(card.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Front (Question/Term)</label>
                                                            <textarea
                                                                value={card.front}
                                                                onChange={(e) => updateFlashcard(card.id, 'front', e.target.value)}
                                                                placeholder="Enter question or term..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                                rows="3"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Back (Answer/Definition)</label>
                                                            <textarea
                                                                value={card.back}
                                                                onChange={(e) => updateFlashcard(card.id, 'back', e.target.value)}
                                                                placeholder="Enter answer or definition..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                                rows="3"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                                                        <select
                                                            value={card.difficulty}
                                                            onChange={(e) => updateFlashcard(card.id, 'difficulty', e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        >
                                                            <option value="easy">🟢 Easy</option>
                                                            <option value="medium">🟡 Medium</option>
                                                            <option value="hard">🔴 Hard</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quiz Tab */}
                            {activeTab === 'quiz' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">🧠 Quiz Questions</h3>
                                        <div className="flex items-center space-x-2">
                                            {quizzes.length > 0 && (
                                                <button
                                                    onClick={generateAutoQuizzes}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                                >
                                                    <span>🔄</span>
                                                    <span>Regenerate</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={addQuiz}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                            >
                                                <span>➕</span>
                                                <span>Add Question</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {quizzes.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="text-6xl mb-4">🧠</div>
                                            <p className="text-lg mb-2">No quiz questions yet</p>
                                            <p className="text-sm mb-6">Generate quiz questions automatically based on your learning module</p>
                                            <div className="flex justify-center space-x-4">
                                                <button
                                                    onClick={generateAutoQuizzes}
                                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                                >
                                                    <span>✨</span>
                                                    <span>Generate Quiz</span>
                                                </button>
                                                <button
                                                    onClick={addQuiz}
                                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                                >
                                                    <span>➕</span>
                                                    <span>Create Manually</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {quizzes.map((quiz, index) => (
                                                <div key={quiz.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                                                        <button
                                                            onClick={() => deleteQuiz(quiz.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                                            <textarea
                                                                value={quiz.question}
                                                                onChange={(e) => updateQuiz(quiz.id, 'question', e.target.value)}
                                                                placeholder="Enter your quiz question..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                                rows="2"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                                                            <div className="space-y-2">
                                                                {quiz.options.map((option, optionIndex) => (
                                                                    <div key={optionIndex} className="flex items-center space-x-3">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${quiz.id}`}
                                                                            checked={quiz.correctAnswer === optionIndex}
                                                                            onChange={() => updateQuiz(quiz.id, 'correctAnswer', optionIndex)}
                                                                            className="text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-600 w-6">{String.fromCharCode(65 + optionIndex)}.</span>
                                                                        <input
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => updateQuizOption(quiz.id, optionIndex, e.target.value)}
                                                                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct answer</p>
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                                                            <textarea
                                                                value={quiz.explanation}
                                                                onChange={(e) => updateQuiz(quiz.id, 'explanation', e.target.value)}
                                                                placeholder="Explain why this answer is correct..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                                rows="2"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resources Tab */}
                            {activeTab === 'resources' && (
                                <div className="space-y-6">
                                    <ResourceIntegration 
                                        module={module} 
                                        integratedResources={integratedResources}
                                        setIntegratedResources={setIntegratedResources}
                                    />
                                </div>
                            )}

                            {/* Mind Map Tab */}
                            {activeTab === 'mindmap' && (
                                <div className="space-y-6">
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🗺️</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Mind Map Visualization</h3>
                                        <p className="text-gray-600 mb-6">Visual representation of your learning path</p>
                                        
                                        {module && (
                                            <div className="max-w-2xl mx-auto">
                                                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-2xl border-2 border-indigo-200">
                                                    <div className="text-center mb-6">
                                                        <div className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full text-lg font-bold">
                                                            {module.moduleTitle}
                                                        </div>
                                                    </div>
                                                    
                                                    {module.subTopics && module.subTopics.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                            {module.subTopics.map((topic, index) => (
                                                                <div key={index} className="relative">
                                                                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 text-center">
                                                                        <div className="text-sm font-medium text-gray-800">{topic}</div>
                                                                    </div>
                                                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0.5 h-4 bg-indigo-300"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-6 text-center">
                                                        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                                                            <span className="text-sm text-gray-600">Estimated Time:</span>
                                                            <span className="text-sm font-medium text-indigo-600">{module.estimatedHours || 'N/A'} hours</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                    <p className="text-sm text-yellow-700">
                                                        🚧 <strong>Coming Soon:</strong> Interactive mind map editor with drag-and-drop functionality, 
                                                        custom connections, and collaborative features!
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyToolkit;