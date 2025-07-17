import React from "react";
import './Team.css';
import boi from "../assets/boi.jpg";
import girl from "../assets/nigama.png";
import githubLogo from "../assets/github.jpeg";
import linkedinLogo from "../assets/linkedin.jpeg";

function TeamSection() {
    const Member = ({ image, name, description, github, linkedin }) => (
        <div className="member-card">
            <div className="member-image">
                <img src={image} alt={`${name}`} />
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <div className="member-icon">
                {github && (
                    <a href={github} target="_blank" rel="noreferrer">
                        <img src={githubLogo} alt="GitHub" className="icon-img" />
                    </a>
                )}
                {linkedin && (
                    <a href={linkedin} target="_blank" rel="noreferrer">
                        <img src={linkedinLogo} alt="LinkedIn" className="icon-img" />
                    </a>
                )}
            </div>
        </div>
    );

    return (
        <section className="members">
            <h2>Our Team</h2>
            <div className="members-grid">
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
        </section>
    );
}

export default TeamSection;