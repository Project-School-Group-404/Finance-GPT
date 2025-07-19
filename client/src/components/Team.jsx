import boi from "../assets/boi.jpg";
import girl from "../assets/nigama.png";
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';

function TeamSection() {
    const { theme } = useTheme();

    console.log('Team component rendered, theme:', theme); // Debug log

    if (!theme) {
        return <div>Loading theme...</div>;
    }

    const Member = ({ image, name, description, github, linkedin }) => (
        <div className="border rounded-2xl p-8 transition-all duration-300 ease-in-out shadow-sm hover:transform hover:-translate-y-2 hover:shadow-lg w-full max-w-sm mx-auto"
             style={{ 
                 backgroundColor: 'var(--bg-secondary)', 
                 borderColor: 'var(--border-color)',
                 boxShadow: 'var(--shadow-sm)'
             }}>
            <div className="flex justify-center mb-6">
                <img 
                    src={image} 
                    alt={`${name}`} 
                    className="w-24 h-24 rounded-full object-cover border-2 transition-transform duration-300 hover:scale-105"
                    style={{ borderColor: 'var(--border-color)' }}
                />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>{name}</h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            <div className="flex justify-center gap-6">
                {github && (
                    <a href={github} target="_blank" rel="noreferrer">
                        <i className="fab fa-github text-2xl transition-all duration-200 hover:scale-110"
                           style={{ 
                               color: 'var(--text-secondary)',
                               '--hover-color': 'var(--text-primary)'
                           }}
                           onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                           onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        ></i>
                    </a>
                )}
                {linkedin && (
                    <a href={linkedin} target="_blank" rel="noreferrer">
                        <i className="fab fa-linkedin text-2xl transition-all duration-200 hover:scale-110"
                           style={{ 
                               color: 'var(--text-secondary)',
                               '--hover-color': 'var(--text-primary)'
                           }}
                           onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                           onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        ></i>
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'hidden' }}>
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content */}

            {/* Team Section - With Top Padding for Fixed Navbar */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Our Team</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 justify-items-center max-w-6xl mx-auto">
                <Member
                    image={boi}
                    name="Ehsaas Nahata"
                    description="245523748018"
                    github="https://github.com/EhsaasN"
                    linkedin="https://linkedin.com/in/ehsaas-nahata-836544347"
                />
                <Member
                    image={boi}
                    name="Aditya Vidiyala"
                    description="245523748065"
                    github="https://github.com/adityavidiyala"
                    linkedin="https://linkedin.com/in/aditya-vidiyala-45686628b"
                />
                <Member
                    image={boi}
                    name="Kanduri Adithya"
                    description="245523748091"
                    github="https://github.com/kanduri-adithya"
                    linkedin="https://linkedin.com/in/adithya-kanduri-997547330"
                />
                <Member
                    image={boi}
                    name="K.P. Srinandana Sarma"
                    description="245523748096"
                    github="https://github.com/Swio9152"
                    linkedin="https://www.linkedin.com/in/srinandana-sarma-923104263"
                />
                <Member
                    image={boi}
                    name="T Sai Krishna"
                    description="245523748121"
                    github="https://github.com/Sai-Krishna-Nair"
                    linkedin="https://linkedin.com/in/sai-krishna-nair-2b4501306"
                />
                <Member
                    image={girl}
                    name="Nigama Reddy V"
                    description="245523748124"
                    github="https://github.com/Nigama-Reddy-V"
                    linkedin="https://linkedin.com/in/nigama-reddy-887496300"
                />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TeamSection;