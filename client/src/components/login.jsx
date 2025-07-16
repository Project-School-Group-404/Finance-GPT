import { useState } from 'react';

export default function Login({ onToggle, onLoginSuccess, onBackToLanding }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'error' or 'success'

    const handleLogin = async () => {
        if (!email || !password) {
            setMessage("Please enter both email and password.");
            setMessageType('error');
            return;
        }

        setMessage(''); // Clear any previous message

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage("Login successful!");
                setMessageType('success');
                // Add a slight delay before proceeding
                setTimeout(() => {
                    // Pass user data to parent component
                    if (onLoginSuccess && result.user) {
                        onLoginSuccess(result.user);
                        // Redirect to dashboard in the same tab
                        window.location.href = '/dashboard';
                    } else {
                        // Fallback: reload page
                        window.location.reload();
                    }
                }, 1000);
            } else {
                const err = await response.json();
                setMessage(err.error || "Login failed");
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
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
                <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>Finance GPT</h1>
            </div>
            <div className="w-full max-w-md p-8 rounded-xl card-shadow min-h-[520px] flex flex-col justify-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex flex-col">
                    <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>

                    {message && (
                        <div className={`text-center mb-6 p-3 rounded-lg ${messageType === 'error'
                                ? 'text-red-500 bg-red-500/10 border border-red-500/20'
                                : 'text-green-500 bg-green-500/10 border border-green-500/20'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-5 mb-8">
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
                        onClick={handleLogin}
                        className="w-full rounded-full font-semibold h-14 mb-4 transition-colors text-base"
                        style={{ backgroundColor: '#000000', color: '#ffffff' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                    >
                        Continue
                    </button>


                    <p className="text-center text-base" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?
                        <button onClick={onToggle} className="ml-1 transition-colors font-medium" style={{ color: 'var(--accent-primary)' }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                        >Sign up</button>
                    </p>
                    <button
                        onClick={() => window.location.href = '/api/auth/google'}
                        className="w-full rounded-full font-semibold h-14 mb-6 flex items-center justify-center gap-2 border border-gray-300 bg-white text-black hover:bg-gray-100 transition-colors"
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google logo"
                            className="h-6 w-6"
                        />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
