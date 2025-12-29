import { useState, useEffect } from "react";
import { Link} from "react-router-dom";
import { motion } from "framer-motion";
import { BiExit } from "react-icons/bi";
import * as Papa from "papaparse";
import Fuse from "fuse.js";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);


  // const navigate = useNavigate();

  useEffect(() => {
    Papa.parse("/UGC_UNILIST.csv", {
      download: true,
      header: true,
      complete: (result: any) => {
        const list = result.data
          .map((r: any) => r.UniversityName?.trim())
          .filter(Boolean);
        setUniversities(list);
      },
    });
  }, []);

  const fuse = new Fuse(universities, { threshold: 0.35 });

  const handleUniversityChange = (value: string) => {
    setUniversity(value);
    if (!value) return setFilteredUniversities([]);
    setFilteredUniversities(fuse.search(value).slice(0, 6).map(r => r.item));
  };

  const handleSignup = (e: any) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  if (!username || !password || !university) {
    setError("Please fill all fields");
    setIsLoading(false);
    return;
  }

  setTimeout(() => {
    setApplied(true);

    localStorage.setItem(
      "application",
      JSON.stringify({ username, university, status: "Applied" })
    );

    setIsLoading(false);

  }, 800);
};


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070412] text-white overflow-hidden">
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-purple-600/20 blur-[160px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="flex justify-end p-4">
          <Link to="/" className="text-white/60 hover:text-red-400 transition">
            <BiExit size={22} />
          </Link>
        </div>

        <div className="px-8 pb-10">
          <h1 className="text-3xl font-semibold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-300 bg-clip-text text-transparent">
              University Onboarding
            </span>
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <Field label="Username">
              {/* @ts-ignore */}
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="University username" />
            </Field>

            <Field label="University">
              <Input
                value={university}
                /* @ts-ignore */ 
                onChange={e => handleUniversityChange(e.target.value)}
                placeholder="Search university"
              />
              {filteredUniversities.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full rounded-xl bg-[#120a28] border border-white/10 shadow-xl max-h-48 overflow-auto">
                  {filteredUniversities.map((u, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setUniversity(u);
                        setFilteredUniversities([]);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-purple-500/20"
                    >
                      {u}
                    </li>
                  ))}
                </ul>
              )}
            </Field>

            <Field label="Password">
              {/* @ts-ignore */}
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Secure password" />
            </Field>

            <motion.button
  whileHover={!applied ? { scale: 1.05 } : {}}
  whileTap={!applied ? { scale: 0.95 } : {}}
  disabled={isLoading || applied}
  className={`w-full rounded-full py-4 text-lg font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.45)]
    ${
      applied
        ? "bg-green-600 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-500"
    }`}
>
  {isLoading
    ? "Applying…"
    : applied
    ? "Applied"
    : "Apply Onboarding"}
</motion.button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="relative">
      <label className="block mb-1 text-sm text-purple-200">{label}</label>
      {children}
    </div>
  );
}

function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full rounded-xl px-4 py-3 bg-white/10 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500/50 transition"
    />
  );
}
