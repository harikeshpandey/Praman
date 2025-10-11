
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-4">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-praman-purple/20 via-praman-dark/0 to-praman-dark"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
          Verifiable Credentials,
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-praman-purple-light to-purple-400">
            Powered by Web3
          </span>
        </h1>
        <p className="text-lg md:text-xl text-praman-light max-w-2xl mx-auto mb-8">
          **Praman** brings academic credentials onto the blockchain, ensuring they are tamper-proof, instantly verifiable, and owned by you.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-praman-purple text-white font-bold py-3 px-8 rounded-full shadow-xl shadow-praman-purple/20 transition-all duration-300"
        >
          Verify a Credential
        </motion.button>
      </motion.div>
    </section>
  );
};