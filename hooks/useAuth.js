import { useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    reload
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setUserId(user.uid);
                setEmailVerified(user.emailVerified);
                setIsAuthReady(true);
            } else {
                setUser(null);
                setUserId(null);
                setEmailVerified(false);
                setIsAuthReady(true);
            }
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (email, password, displayName) => {
        setLoading(true);
        setAuthError('');
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }
            // Send email verification
            await sendEmailVerification(result.user);
            setVerificationSent(true);
            return result;
        } catch (error) {
            console.error("Sign up error:", error);
            setAuthError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        setAuthError('');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error) {
            console.error("Sign in error:", error);
            setAuthError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        if (!user) return;
        setLoading(true);
        setAuthError('');
        try {
            await sendEmailVerification(user);
            setVerificationSent(true);
        } catch (error) {
            console.error("Resend verification error:", error);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkEmailVerification = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await reload(user);
            // Get the fresh user data after reload
            const currentUser = auth.currentUser;
            if (currentUser) {
                setEmailVerified(currentUser.emailVerified);
            }
        } catch (error) {
            console.error("Check verification error:", error);
        } finally {
            setLoading(false);
        }
    };

    return { 
        user, 
        userId, 
        isAuthReady, 
        authError, 
        loading,
        emailVerified,
        verificationSent,
        signUp, 
        signIn, 
        logout,
        resendVerification,
        checkEmailVerification
    };
};