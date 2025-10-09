import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WalletContextProvider from './contexts/WalletContextProvider';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';
import './index.css';
import { Features } from './components/Features';

export default function App() {
  return (
    <WalletContextProvider>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/features" element={<Features />} />
          </Routes>
        </BrowserRouter>
      </div>
    </WalletContextProvider>
  );
}