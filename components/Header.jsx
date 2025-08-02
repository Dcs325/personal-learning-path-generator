import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
    const { user, logout, loading } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <h1 className="text-4xl font-bold mb-2">Personalized Learning Path Generator</h1>
                        <p className="text-xl opacity-90">Create customized learning journeys tailored to your goals</p>
                    </div>
                    
                    {user && (
                        <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                                <p className="text-sm opacity-90">Welcome back!</p>
                                <p className="font-medium">{user.displayName || user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing out...' : 'Sign out'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;