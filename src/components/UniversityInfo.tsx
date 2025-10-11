import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram
} from '@solana/web3.js';
import { AlertCircle, CheckCircle2, Loader2, Building2, ExternalLink } from 'lucide-react';

const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);
const UNIVERSITY_SEED = 'university';

const REGISTER_UNIVERSITY_DISCRIMINATOR = Buffer.from([116, 154, 134, 139, 74, 110, 176, 157]);

interface UniversityAccount {
  name: string;
  authority: string;
}

export function UniversityInfo() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [universityData, setUniversityData] = useState<UniversityAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [lastSignature, setLastSignature] = useState('');


  const derivePDA = useCallback((walletPubkey: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(UNIVERSITY_SEED), walletPubkey.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }, []);

  const fetchUniversityData = useCallback(async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError('');
    setTxStatus('Checking blockchain...');

    try {
      const universityPDA = derivePDA(publicKey);
      console.log('Fetching from PDA:', universityPDA.toBase58());

      const accountInfo = await connection.getAccountInfo(universityPDA);
      
      if (!accountInfo) {
        setError('This wallet is not registered as a university');
        setUniversityData(null);
        setTxStatus('');
        return;
      }

      console.log('Account data length:', accountInfo.data.length);
      console.log('Raw data:', accountInfo.data);

      let offset = 8;
      const data = accountInfo.data;

      const nameLength = data.readUInt32LE(offset);
      offset += 4;

      
      const nameBytes = data.slice(offset, offset + nameLength);
      const name = nameBytes.toString('utf8');
      offset += nameLength;

    
      const authorityBytes = data.slice(offset, offset + 32);
      const authority = new PublicKey(authorityBytes).toBase58();

      const universityAccount: UniversityAccount = {
        name,
        authority,
      };

      console.log('Decoded university:', universityAccount);

      setUniversityData(universityAccount);
      setTxStatus('University registration found');
      console.log('University data:', universityAccount);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to fetch university data');
      setUniversityData(null);
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, derivePDA]);

  const handleRegister = async () => {
    if (!publicKey || !connection) {
      setError('Please connect your wallet first');
      return;
    }

    if (!universityName || universityName.trim() === '') {
      setError('Please enter a university name');
      return;
    }

    setLoading(true);
    setError('');
    setLastSignature('');

    try {
      setTxStatus('Deriving program address...');
      const universityPDA = derivePDA(publicKey);
      console.log('University PDA:', universityPDA.toBase58());

      setTxStatus('Building transaction...');

      const nameBuffer = Buffer.from(universityName.trim(), 'utf8');
      const nameLengthBuffer = Buffer.alloc(4);
      nameLengthBuffer.writeUInt32LE(nameBuffer.length, 0);

      const instructionData = Buffer.concat([
        REGISTER_UNIVERSITY_DISCRIMINATOR,
        nameLengthBuffer,
        nameBuffer,
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: universityPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Waiting for wallet approval...');
      console.log('Sending transaction...');

      const signature = await sendTransaction(transaction, connection);
      setLastSignature(signature);
      setTxStatus(`Transaction sent: ${signature.slice(0, 8)}...`);
      console.log('Transaction signature:', signature);

      setTxStatus('Confirming transaction...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      setTxStatus('Registration successful!');
      console.log('Transaction confirmed');

      setTimeout(() => {
        fetchUniversityData();
        setUniversityName('');
      }, 1500);

    } catch (err: any) {
      console.error('Registration failed:', err);
      
      if (err.message?.includes('User rejected')) {
        setError('Transaction was rejected');
      } else if (err.message?.includes('already in use')) {
        setError('This wallet is already registered');
      } else {
        setError(`Registration failed: ${err.message || 'Unknown error'}`);
      }
      
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchUniversityData();
    } else {
      setUniversityData(null);
      setError('');
      setTxStatus('');
    }
  }, [publicKey, fetchUniversityData]);

  const getExplorerUrl = (signature: string, cluster: string = 'devnet') => {
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
   
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">University Registry</h1>
          </div>
          <p className="text-slate-300">Register your institution on Solana blockchain</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${publicKey ? 'bg-green-400' : 'bg-red-400'}`} />
            Wallet Status
          </h2>
          
          <div className="space-y-4">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-12 !transition-all hover:!scale-105" />
            
            {publicKey && (
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Connected Address</p>
                <p className="text-sm text-green-400 font-mono break-all">{publicKey.toBase58()}</p>
              </div>
            )}
          </div>
        </div>
        {txStatus && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-200 text-sm flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {txStatus}
            </p>
            {lastSignature && (
              <a
                href={getExplorerUrl(lastSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-2"
              >
                View on Explorer <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}
        {publicKey && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-white">University Status</h2>
            
            {loading && !txStatus && (
              <div className="flex items-center gap-2 text-sky-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p>Checking blockchain...</p>
              </div>
            )}
            
            {universityData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Registered</span>
                </div>
                
                <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">University Name</p>
                    <p className="text-white font-medium">{universityData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Authority</p>
                    <p className="text-slate-300 font-mono text-sm break-all">
                      {universityData.authority}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Program Derived Address</p>
                    <p className="text-slate-300 font-mono text-sm break-all">
                      {derivePDA(publicKey).toBase58()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchUniversityData}
                  disabled={loading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              !loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 text-lg font-semibold">
                    <AlertCircle className="w-6 h-6" />
                    <span>Not Registered</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        University Name
                      </label>
                      <input
                        type="text"
                        value={universityName}
                        onChange={(e) => setUniversityName(e.target.value)}
                        placeholder="Enter university name..."
                        maxLength={50}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    
                    <button
                      onClick={handleRegister}
                      disabled={loading || !universityName.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Register University'
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Program ID: {PROGRAM_ID.toBase58()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UniversityInfo;