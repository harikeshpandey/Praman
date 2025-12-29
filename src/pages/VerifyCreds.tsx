import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "7W1afVktzrn5oMWBRCYHGQHt3QWL3TjsSDNydDFG61nK"
);

const connection = new Connection("https://api.devnet.solana.com");


const decodeString = (buf: Buffer, offset: number) => {
  const len = buf.readUInt32LE(offset);
  offset += 4;
  const value = buf.slice(offset, offset + len).toString("utf8");
  return { value, offset: offset + len };
};

export default function PublicVerifier() {
  const [pubkey, setPubkey] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const info = await connection.getAccountInfo(
        new PublicKey(pubkey.trim())
      );
      if (!info) throw new Error("Credential account not found");

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

      setResult({
        degree: degreeRes.value,
        graduationYear,
        cgpa,
        student,
        studentName: studentNameRes.value,
        university,
        universityName: uniNameRes.value,
        revoked,
      });
    } catch (e: any) {
      setError(e.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };
console.log(PROGRAM_ID)

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex items-center justify-center px-4">
    <div className="w-full max-w-xl">
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Public Credential Verifier
          </h1>
          <p className="text-slate-400 text-sm">
            Verify academic credentials stored on Solana blockchain
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Credential Public Key
          </label>

          <input
            value={pubkey}
            onChange={(e) => setPubkey(e.target.value)}
            placeholder="e.g. 7W1afVktzrn5oMWBRCYH..."
            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <p className="text-xs text-slate-500">
            Paste the on-chain credential account address
          </p>
        </div>

        <button
          onClick={verify}
          disabled={loading || !pubkey}
          className={`w-full rounded-lg py-3 font-semibold transition-all ${
            loading || !pubkey
              ? "bg-slate-700 cursor-not-allowed text-slate-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Verifying credential..." : "Verify Credential"}
        </button>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800 p-6">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Verification Result
              </h2>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold ${
                  result.revoked
                    ? "bg-red-600/20 text-red-400 border border-red-600"
                    : "bg-green-600/20 text-green-400 border border-green-600"
                }`}
              >
                {result.revoked ? "Credential Revoked" : "Credential Valid"}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">University</dt>
                <dd className="font-medium">{result.universityName}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-400">Degree</dt>
                <dd className="font-medium">{result.degree}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-400">Student</dt>
                <dd className="font-medium">{result.studentName}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-400">Graduation Year</dt>
                <dd>{result.graduationYear}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-slate-400">CGPA</dt>
                <dd>{result.cgpa.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="border-t border-slate-700 pt-4 space-y-2 text-xs text-slate-400 font-mono break-all">
              <p>
                <span className="font-semibold">Credential:</span> {pubkey}
              </p>
              <p>
                <span className="font-semibold">Student:</span> {result.student}
              </p>
              <p>
                <span className="font-semibold">University:</span> {result.university}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
