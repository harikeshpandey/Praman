
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WalletContextProvider from './contexts/WalletContextProvider';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyCreds from './pages/VerifyCreds';
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
            <Route path='/login' element={<Login/>}/>
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/verifycreds' element={<VerifyCreds/>}/>
          </Routes>
        </BrowserRouter>
      </div>
    </WalletContextProvider>
  );
}