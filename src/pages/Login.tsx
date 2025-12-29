import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiExit } from "react-icons/bi";import { useEffect } from "react";



export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e: any) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  if (!username || !password) {
    setError("Please enter username and password");
    setIsLoading(false);
    return;
  }

  setTimeout(() => {
    localStorage.setItem(
      "session",
      JSON.stringify({
        username,
        role: "university",
        loggedIn: true,
      })
    );

    setIsLoading(false);
    navigate("/app");
  }, 700);
};
useEffect(() => {
  const session = localStorage.getItem("session");
  if (session) navigate("/app");
}, []);


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070412] text-white overflow-hidden">
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-purple-600/15 blur-[160px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
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
              Login
            </span>
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="Username">
              <Input
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
                placeholder="University username"
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Secure password"
              />
            </Field>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={isLoading}
              className="w-full rounded-full py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-500 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition disabled:opacity-50"
            >
              {isLoading ? "Logging in…" : "Login"}
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
      className="w-full rounded-xl px-4 py-3 bg-white/10 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500/40 transition"
    />
  );
}
