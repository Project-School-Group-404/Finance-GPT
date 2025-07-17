import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Dashboard from './components/dashboard';
import LandingPage from './components/LandingPage';
import AuthSuccess from './components/AuthSuccess';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Team from './components/Team';
import ChatPage from './pages/ChatPage'; // ✅ Chat wrapper for UnifiedChatInterface

import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserSession = () => {
            try {
                const storedUser = localStorage.getItem('fgpt_user');
                const storedLoginStatus = localStorage.getItem('fgpt_isLoggedIn');
                
                if (storedUser && storedLoginStatus === 'true') {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error('Error loading user session:', error);
                localStorage.removeItem('fgpt_user');
                localStorage.removeItem('fgpt_isLoggedIn');
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession();
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('fgpt_user', JSON.stringify(userData));
        localStorage.setItem('fgpt_isLoggedIn', 'true');
        setUser(userData);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('fgpt_user');
        localStorage.removeItem('fgpt_isLoggedIn');
        setUser(null);
        setIsLoggedIn(false);
    };

    if (isLoading) {
        return (
            <ThemeProvider>
                <div className="h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--accent-primary)'}}></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    
                    <Route 
                        path="/login" 
                        element={
                            isLoggedIn ? 
                            <Navigate to="/dashboard" replace /> : 
                            <Login 
                                onToggle={() => window.location.href = '/signup'} 
                                onLoginSuccess={handleLoginSuccess}
                                onBackToLanding={() => window.location.href = '/'}
                            />
                        } 
                    />
                    
                    <Route 
                        path="/signup" 
                        element={
                            isLoggedIn ? 
                            <Navigate to="/dashboard" replace /> : 
                            <Signup 
                                onToggle={() => window.location.href = '/login'}
                                onBackToLanding={() => window.location.href = '/'}
                            />
                        } 
                    />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            isLoggedIn ? 
                            <Dashboard user={user} onLogout={handleLogout} /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    <Route path="/team" element={<Team />} />

                    <Route 
                        path="/chat"
                        element={
                            isLoggedIn ? 
                            <ChatPage user={user} isLoggedIn={isLoggedIn} /> : 
                            <Navigate to="/login" replace />
                        }
                    />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    )
}

export default App;