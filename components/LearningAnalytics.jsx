import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

const LearningAnalytics = ({ userId, isAuthReady }) => {
    const [analytics, setAnalytics] = useState({
        totalPaths: 0,
        completedPaths: 0,
        inProgressPaths: 0,
        totalSteps: 0,
        completedSteps: 0,
        averageProgress: 0,
        totalAchievements: 0,
        learningStreak: 0,
        skillsLearned: [],
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !isAuthReady) return;

        const pathsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/learningPaths`);
        const q = query(pathsCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const paths = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            calculateAnalytics(paths);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching analytics data:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, isAuthReady]);

    const calculateAnalytics = (paths) => {
        let totalPaths = paths.length;
        let completedPaths = 0;
        let inProgressPaths = 0;
        let totalSteps = 0;
        let completedSteps = 0;
        let totalAchievements = 0;
        let skillsLearned = new Set();
        let recentActivity = [];

        paths.forEach(path => {
            // Count skills
            if (path.skill) {
                skillsLearned.add(path.skill);
            }

            // Count achievements
            if (path.achievements) {
                totalAchievements += path.achievements.length;
            }

            // Calculate progress for each path
            if (path.path && Array.isArray(path.path)) {
                let pathTotalSteps = 0;
                let pathCompletedSteps = 0;

                path.path.forEach((module, moduleIndex) => {
                    if (module.subTopics && Array.isArray(module.subTopics)) {
                        module.subTopics.forEach((_, topicIndex) => {
                            pathTotalSteps++;
                            totalSteps++;
                            
                            const stepKey = `${moduleIndex}-${topicIndex}`;
                            if (path.progress && path.progress[stepKey]) {
                                pathCompletedSteps++;
                                completedSteps++;
                            }
                        });
                    }
                });

                const pathProgress = pathTotalSteps > 0 ? (pathCompletedSteps / pathTotalSteps) * 100 : 0;
                
                if (pathProgress === 100) {
                    completedPaths++;
                } else if (pathProgress > 0) {
                    inProgressPaths++;
                }
            }

            // Add to recent activity if updated recently
            if (path.lastUpdated) {
                const lastUpdate = path.lastUpdated.toDate ? path.lastUpdated.toDate() : new Date(path.lastUpdated);
                const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
                
                if (daysSinceUpdate <= 7) {
                    recentActivity.push({
                        skill: path.skill,
                        date: lastUpdate,
                        daysAgo: daysSinceUpdate
                    });
                }
            }
        });

        // Sort recent activity by date
        recentActivity.sort((a, b) => b.date - a.date);
        recentActivity = recentActivity.slice(0, 5); // Keep only 5 most recent

        // Calculate learning streak (simplified - days with activity in last 30 days)
        const learningStreak = calculateLearningStreak(paths);

        const averageProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        setAnalytics({
            totalPaths,
            completedPaths,
            inProgressPaths,
            totalSteps,
            completedSteps,
            averageProgress,
            totalAchievements,
            learningStreak,
            skillsLearned: Array.from(skillsLearned),
            recentActivity
        });
    };

    const calculateLearningStreak = (paths) => {
        // Simplified streak calculation - count unique days with progress updates in last 30 days
        const activeDays = new Set();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        paths.forEach(path => {
            if (path.lastUpdated) {
                const updateDate = path.lastUpdated.toDate ? path.lastUpdated.toDate() : new Date(path.lastUpdated);
                if (updateDate >= thirtyDaysAgo) {
                    const dayKey = updateDate.toDateString();
                    activeDays.add(dayKey);
                }
            }
        });

        return activeDays.size;
    };

    if (loading) {
        return (
            <div className="mt-10 pt-8 border-t border-indigo-200">
                <h2 className="text-2xl font-semibold text-indigo-700 mb-4">📈 Learning Analytics</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 pt-8 border-t border-indigo-200">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">📈 Learning Analytics</h2>
            
            {analytics.totalPaths === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <p className="text-gray-600">Start your learning journey to see analytics!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Total Paths */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Paths</p>
                                    <p className="text-2xl font-bold text-indigo-600">{analytics.totalPaths}</p>
                                </div>
                                <div className="text-3xl">📚</div>
                            </div>
                        </div>

                        {/* Completed Paths */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{analytics.completedPaths}</p>
                                </div>
                                <div className="text-3xl">✅</div>
                            </div>
                        </div>

                        {/* Average Progress */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                                    <p className="text-2xl font-bold text-blue-600">{analytics.averageProgress}%</p>
                                </div>
                                <div className="text-3xl">📊</div>
                            </div>
                        </div>

                        {/* Learning Streak */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Days (30d)</p>
                                    <p className="text-2xl font-bold text-orange-600">{analytics.learningStreak}</p>
                                </div>
                                <div className="text-3xl">🔥</div>
                            </div>
                        </div>

                        {/* Total Steps */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Steps Completed</p>
                                    <p className="text-2xl font-bold text-purple-600">{analytics.completedSteps}/{analytics.totalSteps}</p>
                                </div>
                                <div className="text-3xl">👣</div>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                                    <p className="text-2xl font-bold text-yellow-600">{analytics.totalAchievements}</p>
                                </div>
                                <div className="text-3xl">🏆</div>
                            </div>
                        </div>

                        {/* Skills Learned */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Skills</p>
                                    <p className="text-2xl font-bold text-teal-600">{analytics.skillsLearned.length}</p>
                                </div>
                                <div className="text-3xl">🎯</div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-amber-600">{analytics.inProgressPaths}</p>
                                </div>
                                <div className="text-3xl">⏳</div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Overview */}
                    {analytics.skillsLearned.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Skills You're Learning</h3>
                            <div className="flex flex-wrap gap-2">
                                {analytics.skillsLearned.map((skill, index) => (
                                    <span 
                                        key={index}
                                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    {analytics.recentActivity.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Recent Activity</h3>
                            <div className="space-y-2">
                                {analytics.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span className="text-sm text-gray-700">
                                            Progress on <span className="font-medium">{activity.skill}</span>
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {activity.daysAgo === 0 ? 'Today' : 
                                             activity.daysAgo === 1 ? 'Yesterday' : 
                                             `${activity.daysAgo} days ago`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress Visualization */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Overall Progress</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Completion Rate</span>
                                    <span>{analytics.averageProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${analytics.averageProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{analytics.completedPaths}</div>
                                    <div className="text-gray-600">Completed</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-600">{analytics.inProgressPaths}</div>
                                    <div className="text-gray-600">In Progress</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-400">{analytics.totalPaths - analytics.completedPaths - analytics.inProgressPaths}</div>
                                    <div className="text-gray-600">Not Started</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningAnalytics;