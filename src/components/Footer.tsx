import React, { useState } from 'react';
import {  FiGithub, FiLinkedin } from 'react-icons/fi';
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png"

const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconStyle: React.CSSProperties = {
    color: isHovered ? '#c084fc' : '#e2e8f0', 
    fontSize: '1.5rem',
    transition: 'color 0.3s ease',
    textDecoration: 'none',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={iconStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
};

export const Footer = () => {
  const footerStyle: React.CSSProperties = {
    backgroundColor: '#0a081a', 
    padding: '3rem 2rem',
    borderTop: '1px solid rgba(147, 51, 234, 0.2)', 
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', 
    gap: '1.5rem',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
  };

  const copyrightStyle: React.CSSProperties = {
    color: '#e2e8f0',
    opacity: 0.8,
    fontSize: '0.9rem',
  };

  const socialsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  };

  return (
    <footer style={footerStyle}>
      <div style={contentStyle}>
        <div>
          <div style={logoStyle}>
                  <img src={PramanLogo} alt="Praman Logo" className='felx px-5 justify-center scale-300 h-[50px] w-auto object-scale-down'/>
          </div>
          <p style={copyrightStyle}>
            © {new Date().getFullYear()} Praman. All Rights Reserved.
          </p>
        </div>
        <div style={socialsContainerStyle}>
          <SocialIcon href="https://linkedin.com/in/harikeshpandey043">
            <FiLinkedin />
          </SocialIcon>
          <SocialIcon href="https://github.com/harikeshpandey">
            <FiGithub />
          </SocialIcon>
          
        </div>
      </div>
    </footer>
  );
};