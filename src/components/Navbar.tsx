
export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-8 flex justify-between items-center backdrop-blur-xs">
      <h1 className="text-2xl font-bold text-white">Praman</h1>
      <div className="flex items-center gap-6">
        <a href="/features" className="text-praman-light hover:text-white transition-colors">Features</a>
        <a href="#about" className="text-praman-light hover:text-white transition-colors">About</a>
        <button className="bg-praman-purple hover:bg-praman-purple-light text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300">
          Launch App
        </button>
      </div>
    </nav>
  );
};