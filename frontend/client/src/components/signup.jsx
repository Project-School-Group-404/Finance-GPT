import { useState } from 'react';

export default function Signup({ onToggle, onBackToLanding }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'error' or 'success'

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setMessage("Please fill in all fields.");
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
                        className="w-full rounded-full font-semibold h-14 mb-6 transition-colors text-base"
                        style={{backgroundColor: '#000000', color: '#ffffff'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                    >
                        Create account
                    </button>

                    <p className="text-center text-base" style={{color: 'var(--text-secondary)'}}>
                        Already have an account? 
                        <button onClick={onToggle} className="ml-1 transition-colors font-medium" style={{color: 'var(--accent-primary)'}}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                        >Sign in</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
