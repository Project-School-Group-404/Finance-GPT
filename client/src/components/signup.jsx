import { useState } from 'react';

export default function Signup({ onToggle, onBackToLanding }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'error' or 'success'

    const allowedDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com',
        'protonmail.com', 'zoho.com', 'mail.com', 'gmx.com', 'yandex.com', 'rediffmail.com'
    ];

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setMessage("Please fill in all fields.");
            setMessageType('error');
            return;
        }

        // Email domain validation
        const emailDomain = email.trim().split('@')[1]?.toLowerCase();
        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
            setMessage("Please use a valid email address from a popular provider (e.g., Gmail, Yahoo, Outlook, etc).");
            setMessageType('error');
            return;
        }

        setMessage(''); // Clear any previous message

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
            });
            
            if (response.ok) {
                const result = await response.json();
                setMessage("Account created successfully! Redirecting to login...");
                setMessageType('success');
                // Redirect to login after successful signup
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                const err = await response.json();
                setMessage(err.error || "Signup failed");
                setMessageType('error');
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('fetch')) {
                setMessage("Cannot connect to server. Please make sure the backend is running on port 3001.");
                setMessageType('error');
            } else {
                setMessage("Network or server error");
                setMessageType('error');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="absolute top-6 left-6 flex items-center space-x-4">
                {onBackToLanding && (
                    <button 
                        onClick={onBackToLanding}
                        className="p-2 rounded-lg transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        title="Back to Home"
                    >
                        ← Back
                    </button>
                )}
                <h1 className="text-2xl font-bold" style={{color: 'var(--accent-primary)'}}>Finance GPT</h1>
            </div>
            <div className="w-full max-w-md p-8 rounded-xl card-shadow min-h-[600px] flex flex-col justify-center" style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)'}}>
                <div className="flex flex-col">
                    <h2 className="text-3xl font-bold text-center mb-8" style={{color: 'var(--text-primary)'}}>Create account</h2>
                    
                    {message && (
                        <div className={`text-center mb-6 p-3 rounded-lg ${
                            messageType === 'error' 
                                ? 'text-red-500 bg-red-500/10 border border-red-500/20' 
                                : 'text-green-500 bg-green-500/10 border border-green-500/20'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-5 mb-8">
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name"
                            className="w-full rounded-full h-14 px-6 focus:outline-none transition-all text-base"
                            style={{
                                border: '2px solid var(--border-color)', 
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                WebkitBoxShadow: '0 0 0 1000px var(--bg-primary) inset',
                                WebkitTextFillColor: 'var(--text-primary)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)'
                                e.target.style.boxShadow = 'var(--input-focus-ring)'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)'
                                e.target.style.boxShadow = 'none'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                        />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full rounded-full h-14 px-6 focus:outline-none transition-all text-base"
                            style={{
                                border: '2px solid var(--border-color)', 
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                WebkitBoxShadow: '0 0 0 1000px var(--bg-primary) inset',
                                WebkitTextFillColor: 'var(--text-primary)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)'
                                e.target.style.boxShadow = 'var(--input-focus-ring)'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)'
                                e.target.style.boxShadow = 'none'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                        />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full rounded-full h-14 px-6 focus:outline-none transition-all text-base"
                            style={{
                                border: '2px solid var(--border-color)', 
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                WebkitBoxShadow: '0 0 0 1000px var(--bg-primary) inset',
                                WebkitTextFillColor: 'var(--text-primary)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)'
                                e.target.style.boxShadow = 'var(--input-focus-ring)'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)'
                                e.target.style.boxShadow = 'none'
                                e.target.style.WebkitBoxShadow = '0 0 0 1000px var(--bg-primary) inset'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSignup}
                        className="w-full rounded-full font-semibold h-14 mb-8 transition-colors text-base"
                        style={{backgroundColor: '#000000', color: '#ffffff'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                    >
                        Create account
                    </button>

                    <p className="text-center text-base mb-8" style={{color: 'var(--text-secondary)'}}>
                        Already have an account? 
                        <button onClick={onToggle} className="ml-1 transition-colors font-medium" style={{color: 'var(--accent-primary)'}}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                        >Sign in</button>
                    </p>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/api/auth/google'}
                        className="w-full rounded-full font-semibold h-14 flex items-center justify-center gap-3 border transition-colors"
                        style={{ 
                            borderColor: 'var(--border-color)', 
                            backgroundColor: 'var(--bg-primary)', 
                            color: 'var(--text-primary)' 
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-primary)'}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
