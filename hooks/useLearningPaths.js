import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const useLearningPaths = (userId, isAuthReady) => {
    const [savedPaths, setSavedPaths] = useState([]);
    const [pathError, setPathError] = useState('');

    // Fetch saved paths when auth and db are ready and userId is set
    useEffect(() => {
        if (db && userId && isAuthReady) {
            const pathsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/learningPaths`);
            // Note: orderBy is commented out as per instructions to avoid potential index issues.
            // Data will be sorted in memory if needed.
            const q = query(pathsCollectionRef); // , orderBy('createdAt', 'desc')

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const paths = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort in memory if orderBy is not used in query
                paths.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
                setSavedPaths(paths);
            }, (err) => {
                console.error("Error fetching saved paths:", err);
                setPathError("Failed to load saved paths.");
            });

            return () => unsubscribe(); // Clean up listener on unmount
        }
    }, [userId, isAuthReady]);

    // Save generated path to Firestore
    const savePath = async (skill, proficiency, learningStyle, timePerWeek, targetCompletion, difficultyLevel, learningPreference, generatedPath) => {
        if (!generatedPath || !db || !userId) {
            setPathError("Cannot save an empty or invalid path, or user not authenticated.");
            return false;
        }

        try {
            const pathsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/learningPaths`);
            await addDoc(pathsCollectionRef, {
                skill,
                proficiency,
                learningStyle,
                timePerWeek,
                targetCompletion,
                difficultyLevel,
                learningPreference,
                path: generatedPath,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            });
            setPathError(''); // Clear any previous errors
            return true;
        } catch (e) {
            console.error("Error saving path:", e);
            setPathError("Failed to save learning path.");
            return false;
        }
    };

    // Delete a saved path from Firestore
    const deletePath = async (id) => {
        if (!db || !userId) {
            setPathError("User not authenticated to delete paths.");
            return false;
        }
        try {
            const pathDocRef = doc(db, `artifacts/${appId}/users/${userId}/learningPaths`, id);
            await deleteDoc(pathDocRef);
            return true;
        } catch (e) {
            console.error("Error deleting path:", e);
            setPathError("Failed to delete learning path.");
            return false;
        }
    };

    return {
        savedPaths,
        pathError,
        savePath,
        deletePath
    };
};