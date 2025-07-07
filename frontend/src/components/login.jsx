import { useState } from 'react';

export default function Login({ onToggle, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (response.ok) {
                const result = await response.json();
                alert("✅ " + result.message);
                // Pass user data to parent component
                if (result.user) {
                    const userId = result.user.id;
                    // Redirect to Streamlit with userId as query param
                    window.location.href = `http://localhost:8501?userId=${userId}`;
                } else {
                    alert("❌ Login failed: No user data received.");
                }

            } else {
                const err = await response.json();
                alert("❌ " + (err.error || "Login failed"));
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('fetch')) {
                alert("❌ Cannot connect to server. Please make sure the backend is running on port 3001.");
            } else {
                alert("❌ Network or server error");
            }
        }
    };

    return (
        <div className="bg-[#221d11] min-h-screen flex items-center justify-center" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="w-full max-w-md p-8 rounded-xl bg-[#342c19] border border-[#483e23]">
                <h2 className="text-white text-2xl font-bold text-center mb-6">Welcome back</h2>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-white text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-[#675832] bg-[#342c19] text-white placeholder-[#caba91] h-12 px-4 focus:outline-none"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-white text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-[#675832] bg-[#342c19] text-white placeholder-[#caba91] h-12 px-4 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-[#f4c653] text-[#221d11] rounded-xl font-bold h-10 hover:bg-[#f4c653]/90 transition-colors"
                >
                    Login
                </button>

                <p className="text-center text-[#caba91] text-sm mt-4">
                    Don't have an account?
                    <button onClick={onToggle} className="underline ml-1 text-[#f4c653] hover:text-[#f4c653]/80">Sign up</button>
                </p>
            </div>
        </div>
    );
}