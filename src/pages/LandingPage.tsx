import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png"
import { Footer } from '../components/Footer';

const colors = {
  pramanPurple: '#9333ea',
  pramanPurpleLight: '#a855f7',
  pramanDark: '#0f0c29',
  pramanLight: '#e0e7ff',
  white: '#ffffff',
};

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

const heroStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  overflow: 'hidden',
  padding: '1rem',
};

const heroBackgroundStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `radial-gradient(ellipse at top, ${colors.pramanPurple}33, ${colors.pramanDark}00, ${colors.pramanDark})`,
};

const gradientTextStyle: React.CSSProperties = {
  background: `linear-gradient(to right, ${colors.pramanPurpleLight}, #d8b4fe)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const Navbar = () => (
  <nav style={navStyle}>
   <Link to="/"><img src={PramanLogo} alt="Praman Logo" className='felx px-5 justify-center scale-300 h-[50px] w-auto object-scale-down'/></Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <a href="/features" style={{ color: colors.pramanLight, textDecoration: 'none' }}>Features</a>
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

const Hero = () => (
  <section style={heroStyle}>
    <div style={heroBackgroundStyle}></div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ 
        position: 'relative', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <img src={PramanLogo} alt="Praman Logo" className='felx px-5 justify-center scale-1000 h-[50px] w-auto object-scale-down'/>
      <br />
      
      <h1 style={{ fontSize: 'clamp(3rem, 10vw, 4.25rem)', fontWeight: '800', color: colors.white, lineHeight: 1.2, marginBottom: '1rem' }}>
        <span style={gradientTextStyle}>
          Powered by Web3
        </span>
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: colors.pramanLight, maxWidth: '42rem', margin: '0 auto 2rem auto' }}>
        Praman brings academic credentials onto the blockchain, ensuring they are tamper-proof, instantly verifiable, and owned by you.
      </p>
      
      <Link to="/app">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${colors.pramanPurple}80` }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: colors.pramanPurple,
            color: colors.white,
            fontWeight: 'bold',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 10px 20px ${colors.pramanPurple}33`,
          }}
        >
          Get Started
        </motion.button>
      </Link>
    </motion.div>
  </section>
);

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: colors.pramanDark }}>
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer/>
    </div>
  );
};

export default LandingPage;