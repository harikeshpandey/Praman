
import CredentialManagement from '../components/CredentialManagement';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header className="absolute top-4 right-4">
        <WalletMultiButton />
      </header>
      
      <main className="text-center">    
        <CredentialManagement />
      </main>
    </div>
  );
};

export default HomePage;