import React from 'react';

const SavedPaths = ({ savedPaths, onView, onDelete }) => {
    return (
        <section className="mt-10 pt-8 border-t border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Your Saved Paths</h2>
            {savedPaths.length === 0 ? (
                <p className="text-gray-600">No saved paths yet. Generate one above!</p>
            ) : (
                <ul className="space-y-4">
                    {savedPaths.map((path) => (
                        <li key={path.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{path.skill}</h3>
                                <p className="text-sm text-gray-600">Proficiency: {path.proficiency}</p>
                                {path.learningStyle && path.learningStyle.length > 0 && (
                                    <p className="text-xs text-gray-500">Styles: {path.learningStyle.join(', ')}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Saved: {path.createdAt?.toDate().toLocaleString() || 'N/A'}
                                </p>
                            </div>
                            <div className="flex space-x-2 mt-3 sm:mt-0">
                                <button
                                    onClick={() => onView(path)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => onDelete(path.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default SavedPaths;