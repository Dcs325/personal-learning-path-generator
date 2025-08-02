import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const EmailVerification = () => {
    const { 
        user, 
        emailVerified, 
        verificationSent, 
        loading, 
        authError, 
        resendVerification, 
        checkEmailVerification,
        logout 
    } = useAuth();
    
    const [countdown, setCountdown] = useState(0);
    const [autoCheckInterval, setAutoCheckInterval] = useState(null);

    // Countdown timer for resend button
    useEffect(() => {
        if (verificationSent && countdown === 0) {
            setCountdown(60); // 60 second cooldown
        }
    }, [verificationSent]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Auto-check verification status every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            checkEmailVerification();
        }, 5000);
        setAutoCheckInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []); // Remove checkEmailVerification from dependencies to prevent infinite loop

    // Clear interval when email is verified and redirect to app
    useEffect(() => {
        if (emailVerified && autoCheckInterval) {
            clearInterval(autoCheckInterval);
            setAutoCheckInterval(null);
            // Small delay to show success state before redirect
            setTimeout(() => {
                // The redirect will happen automatically when emailVerified becomes true
                // because the App component will re-render and show the main app
                console.log('Email verified successfully! Redirecting to app...');
            }, 1500);
        }
    }, [emailVerified, autoCheckInterval]);

    const handleResendVerification = async () => {
        try {
            await resendVerification();
        } catch (error) {
            console.error('Failed to resend verification:', error);
        }
    };

    const handleCheckVerification = async () => {
        try {
            await checkEmailVerification();
        } catch (error) {
            console.error('Failed to check verification:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-indigo-600">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a verification email to:
                    </p>
                    <p className="mt-1 text-sm font-medium text-indigo-600">
                        {user?.email}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-700 mb-4">
                            Please check your email and click the verification link to continue.
                        </p>
                        
                        {emailVerified && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                                <p className="text-sm text-green-800">
                                    🎉 Email verified successfully! Redirecting to your learning dashboard...
                                </p>
                            </div>
                        )}

                        {verificationSent && !emailVerified && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                                <p className="text-sm text-green-800">
                                    ✅ Verification email sent! Check your inbox and spam folder.
                                </p>
                            </div>
                        )}

                        {authError && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                <p className="text-sm text-red-800">
                                    {authError}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleCheckVerification}
                            disabled={loading || emailVerified}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {emailVerified ? (
                                <div className="flex items-center">
                                    <div className="text-green-200 mr-2">✅</div>
                                    Email Verified!
                                </div>
                            ) : loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Checking...
                                </div>
                            ) : (
                                'I\'ve verified my email'
                            )}
                        </button>

                        <button
                            onClick={handleResendVerification}
                            disabled={loading || countdown > 0 || emailVerified}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {emailVerified ? (
                                'Email Already Verified'
                            ) : countdown > 0 ? (
                                `Resend in ${countdown}s`
                            ) : loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Resend verification email'
                            )}
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500 text-center mb-3">
                            Wrong email address or want to use a different account?
                        </p>
                        <button
                            onClick={handleLogout}
                            disabled={loading || emailVerified}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {emailVerified ? 'Redirecting...' : 'Sign out and try again'}
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Didn't receive the email? Check your spam folder or try resending.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;