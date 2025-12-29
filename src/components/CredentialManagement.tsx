import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import {
  Eye,
  EyeOff,
  Plus,
  Copy,
  Download,
} from "lucide-react";
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png";

const PROGRAM_ID = new PublicKey(
  "7W1afVktzrn5oMWBRCYHGQHt3QWL3TjsSDNydDFG61nK"
);
const UNIVERSITY_SEED = "university";

const DISCRIMINATORS = {
  REGISTER_UNIVERSITY: [116, 154, 134, 139, 74, 110, 176, 157],
  INITIALIZE_STUDENT: [112, 55, 47, 7, 217, 128, 228, 180],
  ISSUE_CREDENTIAL: [255, 193, 171, 224, 68, 171, 194, 87],
};


interface UniversityAccount {
  name: string;
  authority: string;
}

interface StudentRecord {
  pubkey: string;
  name: string;
  privacyEnabled: boolean;
  secretKey: number[];
}


interface CredentialAccount {
  degree: string;
  graduationYear: number;
  cgpa: number;
  student: string;
  studentName: string | null;
  university: string;
  universityName: string;
  revoked: boolean;
}


type Tab = "university" | "students" | "credentials";


const encodeString = (value: string) => {
  const buf = Buffer.from(value, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(buf.length, 0);
  return Buffer.concat([len, buf]);
};

const decodeString = (buf: Buffer, offset: number) => {
  const len = buf.readUInt32LE(offset);
  offset += 4;
  const value = buf.slice(offset, offset + len).toString("utf8");
  return { value, offset: offset + len };
};

export default function CredentialManagement() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<Tab>("university");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [university, setUniversity] = useState<UniversityAccount | null>(null);
  const [universityName, setUniversityName] = useState("");

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [newStudentName, setNewStudentName] = useState("");

  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [verifyPubkey, setVerifyPubkey] = useState("");
  const [verifiedCredential, setVerifiedCredential] =
    useState<CredentialAccount | null>(null);

  const [issuedCredentialPk, setIssuedCredentialPk] =
    useState<string | null>(null);

  const deriveUniversityPDA = useCallback(() => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(UNIVERSITY_SEED), publicKey!.toBuffer()],
      PROGRAM_ID
    )[0];
  }, [publicKey]);

  const fetchUniversity = useCallback(async () => {
    if (!publicKey) return;

    const info = await connection.getAccountInfo(deriveUniversityPDA());
    if (!info) {
      setUniversity(null);
      return;
    }

    let offset = 8;
    const nameRes = decodeString(info.data, offset);
    offset = nameRes.offset;

    const authority = new PublicKey(
      info.data.slice(offset, offset + 32)
    ).toBase58();

    setUniversity({ name: nameRes.value, authority });
  }, [publicKey, connection, deriveUniversityPDA]);

  const registerUniversity = async () => {
    if (!publicKey || !universityName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.REGISTER_UNIVERSITY),
          encodeString(universityName.trim()),
        ]),
        keys: [
          { pubkey: deriveUniversityPDA(), isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
      });

      await sendTransaction(new Transaction().add(ix), connection);
      setUniversityName("");
      fetchUniversity();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const stored = localStorage.getItem("students");
    if (stored) setStudents(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const addStudent = async () => {
    if (!newStudentName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const student = Keypair.generate();

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.INITIALIZE_STUDENT),
          encodeString(newStudentName.trim()),
        ]),
        keys: [
          { pubkey: student.publicKey, isSigner: true, isWritable: true },
          { pubkey: publicKey!, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
      });

      await sendTransaction(new Transaction().add(ix), connection, {
        signers: [student],
      });

      setStudents((prev) => [
  ...prev,
  {
    pubkey: student.publicKey.toBase58(),
    name: newStudentName.trim(),
    privacyEnabled: false,
    secretKey: Array.from(student.secretKey),
  },
]);


      setNewStudentName("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentPrivacy = (pubkey: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.pubkey === pubkey
          ? { ...s, privacyEnabled: !s.privacyEnabled }
          : s
      )
    );
  };


  const issueCredential = async () => {
    if (
      !publicKey ||
      !university ||
      !degree ||
      !graduationYear ||
      !cgpa ||
      !selectedStudent
    )
      return;

    setLoading(true);
    setError("");

    try {
      const credential = Keypair.generate();

      const yearBuf = Buffer.alloc(2);
      yearBuf.writeUInt16LE(parseInt(graduationYear), 0);

      const cgpaBuf = Buffer.alloc(2);
      cgpaBuf.writeUInt16LE(Math.round(parseFloat(cgpa) * 100), 0);

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.ISSUE_CREDENTIAL),
          encodeString(degree),
          yearBuf,
          cgpaBuf,
        ]),
        keys: [
          { pubkey: credential.publicKey, isSigner: true, isWritable: true },
          { pubkey: deriveUniversityPDA(), isSigner: false, isWritable: false },
          {
            pubkey: new PublicKey(selectedStudent),
            isSigner: false,
            isWritable: false,
          },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
      });

      await sendTransaction(new Transaction().add(ix), connection, {
        signers: [credential],
      });

      setIssuedCredentialPk(credential.publicKey.toBase58());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredential = async () => {
    setVerifiedCredential(null);
    setError("");
   

    try {
      const info = await connection.getAccountInfo(
        new PublicKey(verifyPubkey)
      );
      if (!info) throw new Error("Credential not found");

      let offset = 8;
      const degreeRes = decodeString(info.data, offset);
      offset = degreeRes.offset;

      const graduationYear = info.data.readUInt16LE(offset);
      offset += 2;

      const cgpa = info.data.readUInt16LE(offset) / 100;
      offset += 2;

const student = new PublicKey(
  info.data.slice(offset, offset + 32)
).toBase58();
offset += 32;

const studentNameRes = decodeString(info.data, offset);
offset = studentNameRes.offset;

const university = new PublicKey(
  info.data.slice(offset, offset + 32)
).toBase58();
offset += 32;
const uniNameRes = decodeString(info.data, offset);
offset = uniNameRes.offset;
      const revoked = info.data[offset] === 1;

     const studentName = studentNameRes.value;



setVerifiedCredential({
  degree: degreeRes.value,
  graduationYear,
  cgpa,
  student,
  studentName, 
  university,
  universityName: uniNameRes.value,
  revoked,
});


    } catch (e: any) {
      setError(e.message);
    }
  };


 const exportCredentialJson = async () => {
  if (!verifiedCredential) return;
  
  const isPrivate = students.find(
    (s) => s.pubkey === verifiedCredential.student
  )?.privacyEnabled;

  const payload = {
    university: verifiedCredential.universityName,
    degree: verifiedCredential.degree,
    student: {
  name: verifiedCredential.studentName,
  pubkey: verifiedCredential.student,
},

    ...(isPrivate
      ? {}
      : {
          graduationYear: verifiedCredential.graduationYear,
          cgpa: verifiedCredential.cgpa,
        }),
    revoked: verifiedCredential.revoked,
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "credential.json";
  a.click();
};


  useEffect(() => {
    if (publicKey) fetchUniversity();
  }, [publicKey, fetchUniversity]);
console.log(loading);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="text-center space-y-2">
          <img src={PramanLogo} alt="IMG" className="h-16 mx-auto scale-730" />
          <h1 className="text-4xl font-bold tracking-tight">
            Credential Management
          </h1>
          <p className="text-slate-400 text-sm">
            Issue, manage, and verify academic credentials
          </p>
        </header>

        <div className="flex justify-center">
          <WalletMultiButton />
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="flex rounded-xl overflow-hidden border border-slate-800">
          {["university", "students", "credentials"].map((t) => (
            <button
              key={t}
              //@ts-ignore
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition
                ${
                  activeTab === t
                    ? "bg-purple-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "university" && (
          <section className="rounded-xl bg-slate-900 p-6 space-y-4">
            {university ? (
              <p className="text-green-400 font-medium">
                Registered University: {university.name}
              </p>
            ) : (
              <>
                <input
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="University Name"
                  className="w-full rounded-lg bg-slate-800 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={registerUniversity}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500"
                >
                  Register University
                </button>
              </>
            )}
          </section>
        )}

        {activeTab === "students" && (
          <section className="rounded-xl bg-slate-900 p-6 space-y-6">
            <div className="flex gap-3">
              <input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Student Name"
                className="flex-1 rounded-lg bg-slate-800 px-4 py-2 outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={addStudent}
                className="rounded-lg bg-green-600 px-4 hover:bg-green-500"
              >
                <Plus />
              </button>
            </div>

            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.pubkey}
                  className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-3"
                >
                  <span className="font-medium">{s.name}</span>
                  <button
                    onClick={() => toggleStudentPrivacy(s.pubkey)}
                    className="text-slate-400 hover:text-white"
                  >
                    {s.privacyEnabled ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "credentials" && (
          <section className="rounded-xl bg-slate-900 p-6 space-y-4">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg bg-slate-800 px-4 py-2"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.pubkey} value={s.pubkey}>
                  {s.name}
                </option>
              ))}
            </select>

            {[
              ["Degree", degree, setDegree],
              ["Graduation Year", graduationYear, setGraduationYear],
              ["CGPA", cgpa, setCgpa],
            ].map(([label, val, setter]) => (
              <input
              //@ts-ignore
                key={label}
                //@ts-ignore
                value={val}
                //@ts-ignore
                onChange={(e) => setter(e.target.value)}
                //@ts-ignore
                placeholder={label}
                className="w-full rounded-lg bg-slate-800 px-4 py-2"
              />
            ))}

            <button
              onClick={issueCredential}
              className="w-full rounded-lg bg-purple-600 py-2 font-medium hover:bg-blue-500"
            >
              Issue Credential
            </button>

            {issuedCredentialPk && (
              <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2 text-xs">
                <span className="truncate font-mono">
                  {issuedCredentialPk}
                </span>
                
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(issuedCredentialPk)
                  }
                >
                  <Copy />
                </button>
              </div>
            )}

            <hr className="border-slate-800" />

            <input
              value={verifyPubkey}
              onChange={(e) => setVerifyPubkey(e.target.value)}
              placeholder="Credential Public Key"
              className="w-full rounded-lg bg-slate-800 px-4 py-2"
            />

            <button
              onClick={verifyCredential}
              className="rounded-lg bg-green-600 px-4 py-2 hover:bg-green-500"
            >
              Verify Credential
            </button>

            {verifiedCredential && (
              <div className="rounded-xl bg-slate-800 p-4 text-sm space-y-1">
                <p className="font-semibold">
                  {verifiedCredential.universityName}
                </p>
                <p>{verifiedCredential.degree}</p>
                <p>
                  Student:{" "}
                  <span className="font-medium">
                    {verifiedCredential.studentName ?? "Unknown"}
                  </span>
                </p>

                {students.find(
                  (s) => s.pubkey === verifiedCredential.student
                )?.privacyEnabled ? (
                  <p className="text-purple-400">Private</p>
                ) : (
                  <>
                    <p>Year: {verifiedCredential.graduationYear}</p>
                    <p>CGPA: {verifiedCredential.cgpa}</p>
                  </>
                )}

                <button
                  onClick={exportCredentialJson}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
                >
                  <Download size={16} /> Export JSON
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
