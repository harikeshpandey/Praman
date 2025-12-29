
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PramanLogo from "../assets/Gemini_Generated_Image_o7wiwlo7wiwlo7wi-removebg-preview.png";
import { Footer } from "../components/Footer";
import { useEffect, useState } from "react";



export default function LandingPage() {
 const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0b061a] text-white overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center">
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,#9333ea33,transparent_60%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-4xl text-center px-6"
        >
          <br />
          <br />
          <br />
          <img src={PramanLogo} alt="Logo" className="mx-auto h-14 mb-8 scale-900" />

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-300 bg-clip-text text-transparent">
              Powered by Web3 Credentials
            </span>
          </h1>

          <p className="text-lg md:text-xl text-purple-200/80 mb-10">
            Academic credentials secured on blockchain - tamper-proof, instantly verifiable, and fully owned by you.
          </p>

          <div className="flex justify-center gap-6">
           {!isLoggedIn ? (
  <>
    <PrimaryButton to="/signup">Get Started</PrimaryButton>
    <GhostButton to="/login">Login</GhostButton>
  </>
) : (
  <PrimaryButton to="/app">Dashboard</PrimaryButton>
)}

          </div>
        </motion.div>
      </section>

      <section className="relative py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
        >
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <motion.nav
  initial={{ y: -80, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-2xl bg-white/5 border-b border-white/10"
>
  <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-8">
    <Link to="/">
      <img src={PramanLogo} alt="Logo" className="h-10 w-auto block scale-450" />
    </Link>

    <div className="flex gap-6 items-center">
    
      <PrimaryButton to="/verifycreds" small>
        Verify Creds
      </PrimaryButton>
    </div>
  </div>
</motion.nav>

  );
}

function FeatureCard({ title, desc }: any) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="rounded-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(147,51,234,0.15)]"
    >
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-purple-200/80">{desc}</p>
    </motion.div>
  );
}

function PrimaryButton({ to, children, small }: any) {
  return (
    <Link to={to}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/30 ${
          small ? "px-5 py-2" : "px-8 py-4"
        } font-semibold`}
      >
        {children}
      </motion.button>
    </Link>
  );
}

function GhostButton({ to, children }: any) {
  return (
    <Link to={to}>
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 rounded-full border border-white/20 backdrop-blur-md"
      >
        {children}
      </motion.button>
    </Link>
  );
}

const features = [
  {
    title: "Tamper-Proof",
    desc: "Credentials stored immutably on blockchain for maximum trust.",
  },
  {
    title: "Instant Verification",
    desc: "Verify academic records globally in seconds.",
  },
  {
    title: "User Owned",
    desc: "You fully control and share your credentials securely.",
  },
];