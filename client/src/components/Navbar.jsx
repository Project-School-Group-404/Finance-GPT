import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    let navigate;
    
    // Try to use navigate, but don't crash if not in Router context
    try {
        navigate = useNavigate();
    } catch (error) {
        console.warn('useNavigate called outside Router context');
        navigate = () => {};
    }

    const handleBackToHome = () => {
        if (navigate) {
            navigate('/');
        } else {
            window.location.href = '/';
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 nav-backdrop border-b" 
             style={{ 
                 backgroundColor: `${theme === 'dark' ? 'rgba(17, 17, 17, 0.8)' : 'rgba(255, 255, 255, 0.8)'}`,
                 borderColor: 'var(--border-color)'
             }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <span 
                            className="text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleBackToHome}
                        >
                            FinanceGPT
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/#features" className="hover:opacity-80 transition-opacity cursor-pointer">Features</a>
                        <a href="/#about" className="hover:opacity-80 transition-opacity cursor-pointer">About</a>
                        <a href="/#documentation" className="hover:opacity-80 transition-opacity cursor-pointer">Documentation</a>
                        <a href="/team" className="hover:opacity-80 transition-opacity cursor-pointer">Team</a>
                    </div>

                    {/* Theme Toggle & Get Started */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={handleBackToHome}
                            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                            style={{ 
                                backgroundColor: 'var(--accent-primary)', 
                                color: 'white',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
