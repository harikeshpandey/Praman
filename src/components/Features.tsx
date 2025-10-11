import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiZap, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PramanLogo from  "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png"
import { Footer } from './Footer';
const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backdropFilter: 'blur(16px)',
};
const colors = {
  pramanPurple: '#9333ea',
  pramanPurpleLight: '#a855f7',
  pramanDark: '#0f0c29',
  pramanLight: '#e0e7ff',
  white: '#ffffff',
};

const features = [
  {
    icon: <FiLock size={28} />,
    title: 'Immutable Records',
    description: 'Once a credential is on the blockchain, it’s permanent and cannot be altered.',
  },
  {
    icon: <FiZap size={28} />,
    title: 'Instant Verification',
    description: 'Verify degrees and certificates in seconds, not weeks, from anywhere in the world.',
  },
  {
    icon: <FiCheckCircle size={28} />,
    title: 'Decentralized Trust',
    description: 'Eliminate reliance on central authorities. Trust is built into the protocol itself.',
  },
];
const Navbar = () => (
  <nav style={navStyle}>
    <Link to="/"><img src={PramanLogo} alt="Praman Logo" className='felx px-5 justify-center scale-300 h-[50px] w-auto object-scale-down'/></Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <Link to="/app">
        <button style={{
          backgroundColor: colors.pramanPurple,
          color: colors.white,
          fontWeight: '600',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        }}>
          Launch App
        </button>
      </Link>
    </div>
  </nav>
);

const cardVariants = (index: number) => ({
  offscreen: {
    y: 50,
    opacity: 0,
    scale: 0.95,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
      delay: index * 0.15, 
    },
  },
});
const sectionStyle: React.CSSProperties = {
  padding: '6rem 1rem',
  backgroundColor: '#0a081a', 
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  textAlign: 'center',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: '2.5rem',
  marginTop: '4rem',
};

if (window.innerWidth >= 768) {
  gridStyle.gridTemplateColumns = 'repeat(3, 1fr)';
}

const cardOuterStyle: React.CSSProperties = {
  background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)', 
  borderRadius: '1.5rem',
  padding: '1px', 
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
};

const cardInnerStyle: React.CSSProperties = {
  backgroundColor: '#1e1a3d', 
  padding: '2.5rem 2rem',
  borderRadius: 'calc(1.5rem - 1px)', 
  height: '100%',
};

const iconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '4rem',
  height: '4rem',
  borderRadius: '9999px',
  margin: '0 auto 1.5rem auto',
  background: 'linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
  color: '#c084fc', 
};
export const Features = () => {
  return (
    <div>
        
        <Navbar/>
    <section id="features" style={sectionStyle}>
      <div style={containerStyle}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Why Praman?</h2>
        <p style={{ color: '#e0e7ff', maxWidth: '42rem', margin: '0 auto', fontSize: '1.125rem' }}>
          Leveraging blockchain to redefine academic and professional verification.
        </p>
        
        <div style={gridStyle}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              style={cardOuterStyle}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              //@ts-ignore
              variants={cardVariants(index)}
              whileHover={{ y: -8, boxShadow: '0 0 40px rgba(192, 132, 252, 0.3)' }} 
            >
              <div style={cardInnerStyle}>
                <div style={iconContainerStyle}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: '#e0e7ff', opacity: 0.9 }}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer/>
    </div>
  );
};