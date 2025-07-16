import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleGetStarted = () => {
        // Open /login route in a new tab
        window.open('/login', '_blank');
    };

    const features = [
        {
            icon: "📄",
            title: "DocQnA",
            description: "Upload and analyze financial documents with AI-powered question answering capabilities."
        },
        {
            icon: "📰",
            title: "News Agent",
            description: "Stay updated with real-time financial news analysis and market insights."
        },
        {
            icon: "💬",
            title: "General QnA",
            description: "Get instant answers to your financial questions with our intelligent chatbot."
        },
        {
            icon: "⚖️",
            title: "Law Agent",
            description: "Navigate complex financial regulations and legal requirements with ease."
        }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 nav-backdrop border-b" 
                 style={{ 
                     backgroundColor: `${theme === 'dark' ? 'rgba(17, 17, 17, 0.8)' : 'rgba(255, 255, 255, 0.8)'}`,
                     borderColor: 'var(--border-color)'
                 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">FinanceGPT</span>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="hover:opacity-80 transition-opacity cursor-pointer">Features</a>
                            <a href="#about" className="hover:opacity-80 transition-opacity cursor-pointer">About</a>
                            <a href="#documentation" className="hover:opacity-80 transition-opacity cursor-pointer">Documentation</a>
                            <a href="#team" className="hover:opacity-80 transition-opacity cursor-pointer">Team</a>
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
                                onClick={handleGetStarted}
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

            {/* Hero Section */}
            <section className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="max-w-7xl mx-auto text-center">
                    <div className="relative">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
                                 style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight landing-hero">
                            <span className="block">Frontier AI.</span>
                            <span className="block gradient-text">
                                In Your Hands.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Configurable AI for all financial builders. Harness the power of artificial intelligence 
                            to revolutionize your financial decision-making.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl cta-button"
                                style={{ 
                                    backgroundColor: 'var(--accent-primary)', 
                                    color: 'white',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                Try out FinanceGPT →
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Powerful Features</h2>
                        <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                            Everything you need to make informed financial decisions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`feature-card p-6 rounded-xl border transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    boxShadow: 'var(--shadow-md)',
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <div className="text-4xl mb-4 floating-element">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-8">
                                Revolutionizing Financial Intelligence
                            </h2>
                            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                                FinanceGPT combines cutting-edge AI technology with deep financial expertise 
                                to provide you with unprecedented insights into markets, regulations, and investment opportunities.
                            </p>
                            <p className="text-lg mb-12" style={{ color: 'var(--text-secondary)' }}>
                                Whether you're analyzing complex documents, staying updated with market news, 
                                or navigating regulatory requirements, our AI-powered platform has you covered.
                            </p>
                            <button
                                onClick={handleGetStarted}
                                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                                style={{ 
                                    backgroundColor: 'var(--accent-primary)', 
                                    color: 'white',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                Start Your Journey
                            </button>
                        </div>
                        <div className="relative">
                            <div className="aspect-video rounded-xl overflow-hidden"
                                 style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--border-color)' }}>
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🤖</div>
                                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                                            AI-Powered Financial Assistant
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-xl font-bold">FinanceGPT</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Empowering financial decisions with AI
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Features</a></li>
                                <li><a href="#about" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>About</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#documentation" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Documentation</a></li>
                                <li><a href="#team" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Team</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#team" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>About Us</a></li>
                                <li><a href="#contact" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        <p>&copy; 2025 FinanceGPT. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
