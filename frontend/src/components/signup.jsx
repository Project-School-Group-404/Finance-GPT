import { useState } from 'react';

export default function Signup({ onToggle }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        if (!name || !email || !password) {
            alert('All fields are required!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: name.trim(), 
                    email: email.trim(), 
                    password 
                }),
            });

            if (res.ok) {
                const result = await res.json();
                alert('✅ Registration successful! Please login with your credentials.');
                // Clear form
                setName('');
                setEmail('');
                setPassword('');
                // Switch to login
                if (onToggle) onToggle();
            } else {
                const err = await res.json();
                alert('❌ ' + (err.error || 'Registration failed'));
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('fetch')) {
                alert("❌ Cannot connect to server. Please make sure the backend is running on port 3001.");
            } else {
                alert('❌ Network or server error');
            }
        }
    };

    return (
        <div className="bg-[#221d11] min-h-screen flex items-center justify-center" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="w-full max-w-md p-8 rounded-xl bg-[#342c19] border border-[#483e23]">
                <h2 className="text-white text-2xl font-bold text-center mb-6">Create Account</h2>

                <div className="mb-4">
                    <label htmlFor="name" className="block text-white text-sm font-medium mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-xl border border-[#675832] bg-[#342c19] text-white placeholder-[#caba91] h-12 px-4 focus:outline-none"
                    />
                </div>

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
                    onClick={handleSignup}
                    className="w-full bg-[#f4c653] text-[#221d11] rounded-xl font-bold h-10 hover:bg-[#f4c653]/90 transition-colors"
                >
                    Sign Up
                </button>

                <p className="text-center text-[#caba91] text-sm mt-4">
                    Already have an account?
                    <button onClick={onToggle} className="underline ml-1 text-[#f4c653] hover:text-[#f4c653]/80">Login</button>
                </p>
            </div>
        </div>
    );
}