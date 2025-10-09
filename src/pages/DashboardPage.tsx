import React from 'react';
import CredentialManagement from '../components/CredentialManagement';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png"

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
const Navbar = () => (
  <nav style={navStyle}>
   <Link to="/"><img src={PramanLogo} alt="Praman Logo" className='felx px-5 justify-center scale-300 h-[50px] w-auto object-scale-down'/></Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      
      <Link to="/app">
        <WalletMultiButton/>
      </Link>
    </div>
  </nav>
);

const DashboardPage = () => {
  return (                                                                                          
    <div className="min-h-screen bg-[#1a162c] text-white p-8">
      <Navbar/>
      <br />
      <main>
        <CredentialManagement />
      </main>
    </div>
  );
};

export default DashboardPage;