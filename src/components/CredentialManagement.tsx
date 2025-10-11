import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  Keypair
} from '@solana/web3.js';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  GraduationCap,
  User,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  XCircle
} from 'lucide-react';
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png"
const PROGRAM_ID = new PublicKey('7W1afVktzrn5oMWBRCYHGQHt3QWL3TjsSDNydDFG61nK');
const UNIVERSITY_SEED = 'university';

const DISCRIMINATORS = {
  REGISTER_UNIVERSITY: [116, 154, 134, 139, 74, 110, 176, 157],
  INITIALIZE_STUDENT: [112, 55, 47, 7, 217, 128, 228, 180],
  ISSUE_CREDENTIAL: [255, 193, 171, 224, 68, 171, 194, 87],
  REVOKE_CREDENTIAL: [38, 123, 95, 95, 223, 158, 169, 87],
  TOGGLE_PRIVACY: [101, 111, 43, 235, 177, 214, 9, 163],
  UPDATE_CREDENTIAL: [96, 104, 180, 182, 200, 19, 178, 1],
  DELETE_CREDENTIAL: [20, 216, 8, 226, 116, 228, 193, 12],
  DELETE_UNIVERSITY: [190, 226, 224, 188, 113, 228, 34, 30],
};

interface UniversityAccount {
  name: string;
  authority: string;
}

interface StudentAccount {
  name: string;
  wallet: string;
  privacyEnabled: boolean;
}

interface CredentialAccount {
  degree: string;
  graduationYear: number;
  student: string;
  university: string;
  revoked: boolean;
  privacyEnabled: boolean;
  cgpa?: number; 
}

type TabType = 'university' | 'student' | 'credential';

export function CredentialManagement() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
 
  const [activeTab, setActiveTab] = useState<TabType>('university');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [lastSignature, setLastSignature] = useState('');
  

  const [universityData, setUniversityData] = useState<UniversityAccount | null>(null);
  const [universityName, setUniversityName] = useState('');
  

  const [studentData, setStudentData] = useState<StudentAccount | null>(null);
  const [studentName, setStudentName] = useState('');
  

  const [degreeInput, setDegreeInput] = useState('');
  const [graduationYearInput, setGraduationYearInput] = useState('');
  const [studentPubkeyInput, setStudentPubkeyInput] = useState('');
  const [verifyCredentialPubkey, setVerifyCredentialPubkey] = useState('');
  const [verifiedCredential, setVerifiedCredential] = useState<CredentialAccount | null>(null);

  const deriveUniversityPDA = useCallback((walletPubkey: PublicKey): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(UNIVERSITY_SEED), walletPubkey.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }, []);
  const encodeString = (str: string): Buffer => {
    const strBuffer = Buffer.from(str, 'utf8');
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(strBuffer.length, 0);
    return Buffer.concat([lengthBuffer, strBuffer]);
  };
  const decodeString = (data: Buffer, offset: number): { value: string; newOffset: number } => {
    const length = data.readUInt32LE(offset);
    offset += 4;
    const value = data.slice(offset, offset + length).toString('utf8');
    return { value, newOffset: offset + length };
  };
  const fetchUniversityData = useCallback(async () => {
    if (!publicKey || !connection) return;
    
    try {
      const universityPDA = deriveUniversityPDA(publicKey);
      const accountInfo = await connection.getAccountInfo(universityPDA);
      
      if (!accountInfo) {
        setUniversityData(null);
        return;
      }

      let offset = 8; 
      const nameResult = decodeString(accountInfo.data, offset);
      offset = nameResult.newOffset;
      
      const authorityBytes = accountInfo.data.slice(offset, offset + 32);
      const authority = new PublicKey(authorityBytes).toBase58();

      setUniversityData({
        name: nameResult.value,
        authority,
      });
    } catch (err) {
      console.error('Fetch university error:', err);
      setUniversityData(null);
    }
  }, [publicKey, connection, deriveUniversityPDA]);

  const fetchStudentData = useCallback(async () => {
    if (!publicKey || !connection) return;
    
    try {
      const accountInfo = await connection.getAccountInfo(publicKey);
      
      if (!accountInfo || accountInfo.owner.toBase58() !== PROGRAM_ID.toBase58()) {
        setStudentData(null);
        return;
      }

      let offset = 8;
      const nameResult = decodeString(accountInfo.data, offset);
      offset = nameResult.newOffset;
      
      const walletBytes = accountInfo.data.slice(offset, offset + 32);
      const wallet = new PublicKey(walletBytes).toBase58();
      offset += 32;
      
      const privacyEnabled = accountInfo.data[offset] === 1;

      setStudentData({
        name: nameResult.value,
        wallet,
        privacyEnabled,
      });
    } catch (err) {
      console.error('Fetch student error:', err);
      setStudentData(null);
    }
  }, [publicKey, connection]);

  const handleRegisterUniversity = async () => {
    if (!publicKey || !connection) {
      setError('Please connect your wallet');
      return;
    }

    if (!universityName.trim()) {
      setError('Please enter a university name');
      return;
    }

    setLoading(true);
    setError('');
    setLastSignature('');

    try {
      const universityPDA = deriveUniversityPDA(publicKey);
      
      const instructionData = Buffer.concat([
        Buffer.from(DISCRIMINATORS.REGISTER_UNIVERSITY),
        encodeString(universityName.trim()),
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
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Waiting for approval...');
      const signature = await sendTransaction(transaction, connection);
      setLastSignature(signature);
      setTxStatus('Confirming...');

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
      setTxStatus('University registered!');
      
      setTimeout(() => {
        fetchUniversityData();
        setUniversityName('');
      }, 1000);
    } catch (err: any) {
      setError(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleInitializeStudent = async () => {
    if (!publicKey || !connection) {
      setError('Please connect your wallet');
      return;
    }

    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');
    setLastSignature('');

    try {
      const studentAccount = Keypair.generate();
      
      const instructionData = Buffer.concat([
        Buffer.from(DISCRIMINATORS.INITIALIZE_STUDENT),
        encodeString(studentName.trim()),
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: studentAccount.publicKey, isSigner: true, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Waiting for approval...');
      const signature = await sendTransaction(transaction, connection, {
        signers: [studentAccount]
      });
      setLastSignature(signature);
      setTxStatus('Confirming...');

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
      setTxStatus(`Student initialized! Save this: ${studentAccount.publicKey.toBase58()}`);
      localStorage.setItem('studentKeypair', JSON.stringify(Array.from(studentAccount.secretKey)));
      
      setTimeout(() => {
        fetchStudentData();
        setStudentName('');
      }, 3000);
    } catch (err: any) {
      setError(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCredential = async () => {
    if (!publicKey || !connection) {
      setError('Please connect your wallet');
      return;
    }

    if (!universityData) {
      setError('You must be a registered university');
      return;
    }

    if (!degreeInput.trim() || !graduationYearInput || !studentPubkeyInput.trim()) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setLastSignature('');

    try {
      const credentialAccount = Keypair.generate();
      const studentPubkey = new PublicKey(studentPubkeyInput);
      const universityPDA = deriveUniversityPDA(publicKey);
      
      const yearBuffer = Buffer.alloc(2);
      yearBuffer.writeUInt16LE(parseInt(graduationYearInput), 0);

      const instructionData = Buffer.concat([
        Buffer.from(DISCRIMINATORS.ISSUE_CREDENTIAL),
        encodeString(degreeInput.trim()),
        yearBuffer,
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: credentialAccount.publicKey, isSigner: true, isWritable: true },
          { pubkey: universityPDA, isSigner: false, isWritable: false },
          { pubkey: studentPubkey, isSigner: false, isWritable: false },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Waiting for approval...');
      const signature = await sendTransaction(transaction, connection, {
        signers: [credentialAccount]
      });
      setLastSignature(signature);
      setTxStatus('Confirming...');

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
      setTxStatus(`Credential issued! ID: ${credentialAccount.publicKey.toBase58()}`);
      
      setTimeout(() => {
        setDegreeInput('');
        setGraduationYearInput('');
        setStudentPubkeyInput('');
      }, 3000);
    } catch (err: any) {
      setError(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyCredential = async () => {
    if (!connection) return;

    setLoading(true);
    setError('');
    setVerifiedCredential(null);

    try {
      const credentialPubkey = new PublicKey(verifyCredentialPubkey);
      const accountInfo = await connection.getAccountInfo(credentialPubkey);
      
      if (!accountInfo) {
        setError('Credential not found');
        return;
      }

      console.log('Raw credential data:', accountInfo.data);
      console.log('Data length:', accountInfo.data.length);

      let offset = 8; 
      const degreeResult = decodeString(accountInfo.data, offset);
      offset = degreeResult.newOffset;
      console.log('Degree:', degreeResult.value, 'Offset now:', offset);
    
      const graduationYear = accountInfo.data.readUInt16LE(offset);
      offset += 2;
      console.log('Graduation Year:', graduationYear, 'Offset now:', offset);
      
      const studentBytes = accountInfo.data.slice(offset, offset + 32);
      const student = new PublicKey(studentBytes).toBase58();
      offset += 32;
      console.log('Student:', student, 'Offset now:', offset);
      
      const universityBytes = accountInfo.data.slice(offset, offset + 32);
      const university = new PublicKey(universityBytes).toBase58();
      offset += 32;
      console.log('University:', university, 'Offset now:', offset);
      
      const revoked = accountInfo.data[offset] === 1;
      offset += 1;
      console.log('Revoked:', revoked, 'Offset now:', offset);
     
      const privacyEnabled = accountInfo.data[offset] === 1;
      offset += 1;
      console.log('Privacy Enabled:', privacyEnabled, 'Offset now:', offset);

      setVerifiedCredential({
        degree: degreeResult.value,
        graduationYear,
        student,
        university,
        revoked,
        privacyEnabled,
      });
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(`Verification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleRevokeCredential = async (credentialPubkey: string) => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError('');

    try {
      const credential = new PublicKey(credentialPubkey);
      const universityPDA = deriveUniversityPDA(publicKey);

      const instructionData = Buffer.from(DISCRIMINATORS.REVOKE_CREDENTIAL);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: credential, isSigner: false, isWritable: true },
          { pubkey: universityPDA, isSigner: false, isWritable: false },
          { pubkey: publicKey, isSigner: true, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Revoking...');
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
      
      setTxStatus('Credential revoked');
      setTimeout(() => setTxStatus(''), 3000);
    } catch (err: any) {
      setError(`Revoke failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleTogglePrivacy = async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError('');

    try {
      const storedKeypair = localStorage.getItem('studentKeypair');
      if (!storedKeypair) {
        setError('Student account not found');
        return;
      }

      const studentKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(storedKeypair))
      );

      const instructionData = Buffer.from(DISCRIMINATORS.TOGGLE_PRIVACY);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: studentKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setTxStatus('Toggling privacy...');
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
      
      setTxStatus('Privacy toggled');
      setTimeout(() => {
        fetchStudentData();
        setTxStatus('');
      }, 1000);
    } catch (err: any) {
      setError(`Toggle failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (publicKey) {
      fetchUniversityData();
      fetchStudentData();
    } else {
      setUniversityData(null);
      setStudentData(null);
    }
  }, [publicKey, fetchUniversityData, fetchStudentData]);

  const getExplorerUrl = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 ">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-12 h-12 text-purple-400" />
             <span>
                <img src={PramanLogo} alt="Praman Logo" className='felx px-10 justify-center scale-340 h-[75px] w-auto object-scale-down'/>
              </span>
            <h1 className="text-4xl font-bold text-white">
                Credential 
              Management System</h1>
          </div>
          <p className="text-slate-300">Issue, verify, and manage credentials on Solana</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-12 !transition-all" />
          {publicKey && (
            <div className="mt-4 bg-slate-900/50 p-3 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Connected Address</p>
              <p className="text-sm text-green-400 font-mono break-all">{publicKey.toBase58()}</p>
            </div>
          )}
        </div>
        {txStatus && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
            <p className="text-blue-200 text-sm flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {txStatus}
            </p>
            {lastSignature && (
              <a href={getExplorerUrl(lastSignature)} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-2">
                View Transaction →
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
            <p className="text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}
        {publicKey && (
          <>
            <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl">
              <button
                onClick={() => setActiveTab('university')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'university'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                University
              </button>
              <button
                onClick={() => setActiveTab('student')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'student'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                Student
              </button>
              <button
                onClick={() => setActiveTab('credential')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'credential'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Credentials
              </button>
            </div>
            {activeTab === 'university' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  University Management
                </h2>

                {universityData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
                      <CheckCircle2 className="w-6 h-6" />
                      Registered
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">University Name</p>
                        <p className="text-white font-medium">{universityData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Authority</p>
                        <p className="text-slate-300 font-mono text-sm break-all">{universityData.authority}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Not registered as a university
                    </p>
                    <input
                      type="text"
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      placeholder="University name..."
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleRegisterUniversity}
                      disabled={loading || !universityName.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register University'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'student' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Student Profile
                </h2>

                {studentData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
                      <CheckCircle2 className="w-6 h-6" />
                      Initialized
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">Name</p>
                        <p className="text-white font-medium">{studentData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Wallet</p>
                        <p className="text-slate-300 font-mono text-sm break-all">{studentData.wallet}</p>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          {studentData.privacyEnabled ? <EyeOff className="w-5 h-5 text-purple-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                          <span className="text-white">Privacy Mode</span>
                        </div>
                        <button
                          onClick={handleTogglePrivacy}
                          disabled={loading}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm disabled:opacity-50"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Student profile not initialized
                    </p>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Your name..."
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleInitializeStudent}
                      disabled={loading || !studentName.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Student'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'credential' && (
              <div className="space-y-6">
                {universityData && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                      <Award className="w-6 h-6" />
                      Issue Credential
                    </h2>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={degreeInput}
                        onChange={(e) => setDegreeInput(e.target.value)}
                        placeholder="Degree (e.g., Bachelor of Science)"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="number"
                        value={graduationYearInput}
                        onChange={(e) => setGraduationYearInput(e.target.value)}
                        placeholder="Graduation Year (e.g., 2024)"
                        min="1900"
                        max="2100"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        value={studentPubkeyInput}
                        onChange={(e) => setStudentPubkeyInput(e.target.value)}
                        placeholder="Student Account Public Key"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                      />
                      <button
                        onClick={handleIssueCredential}
                        disabled={loading || !degreeInput.trim() || !graduationYearInput || !studentPubkeyInput.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Award className="w-5 h-5" /> Issue Credential</>}
                      </button>
                    </div>
                  </div>
                )}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                  <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Verify Credential
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={verifyCredentialPubkey}
                      onChange={(e) => setVerifyCredentialPubkey(e.target.value)}
                      placeholder="Credential Public Key"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                    />
                    <button
                      onClick={handleVerifyCredential}
                      disabled={loading || !verifyCredentialPubkey.trim()}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-5 h-5" /> Verify</>}
                    </button>

                    {verifiedCredential && (
                      <div className="mt-4 bg-slate-900/50 p-4 rounded-lg space-y-3 border-2 border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          {verifiedCredential.revoked ? (
                            <div className="flex items-center gap-2 text-red-400">
                              <XCircle className="w-5 h-5" />
                              <span className="font-semibold">REVOKED</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-semibold">VALID</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-400">Degree</p>
                          <p className="text-white font-medium">{verifiedCredential.degree}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-400">Graduation Year</p>
                          <p className="text-white">{verifiedCredential.graduationYear}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-400">Student</p>
                          <p className="text-slate-300 font-mono text-xs break-all">{verifiedCredential.student}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-400">University</p>
                          <p className="text-slate-300 font-mono text-xs break-all">{verifiedCredential.university}</p>
                        </div>

                        {verifiedCredential.cgpa && (
                          <div>
                            <p className="text-xs text-slate-400">CGPA</p>
                            <p className="text-white">{verifiedCredential.cgpa.toFixed(2)}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                          {verifiedCredential.privacyEnabled ? (
                            <div className="flex items-center gap-2 text-purple-400">
                              <EyeOff className="w-4 h-4" />
                              <span className="text-sm">Privacy Enabled</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Public</span>
                            </div>
                          )}
                        </div>

                        {universityData && !verifiedCredential.revoked && (
                          <button
                            onClick={() => handleRevokeCredential(verifyCredentialPubkey)}
                            disabled={loading}
                            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Revoke This Credential
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {studentData && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                      <Eye className="w-6 h-6" />
                      Privacy Controls
                    </h2>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium mb-1">Privacy Mode</p>
                          <p className="text-sm text-slate-400">
                            {studentData.privacyEnabled 
                              ? 'Your credentials are private' 
                              : 'Your credentials are public'}
                          </p>
                        </div>
                        <button
                          onClick={handleTogglePrivacy}
                          disabled={loading}
                          className={`px-6 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2 ${
                            studentData.privacyEnabled 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-slate-600 hover:bg-slate-700'
                          }`}
                        >
                          {studentData.privacyEnabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          {studentData.privacyEnabled ? 'Make Public' : 'Make Private'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl">
                  <h3 className="text-lg font-semibold mb-3 text-white">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={fetchUniversityData}
                      disabled={loading}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh University
                    </button>
                    <button
                      onClick={fetchStudentData}
                      disabled={loading}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Student
                    </button>
                  </div>
                </div>
                
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CredentialManagement;