import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="py-10 z-10 relative">
      <Link to="/">
        <h1 className="relative text-6xl md:text-8xl font-black text-center tracking-widest">
  
  {/* Glow layer */}
  <span className="absolute inset-0 blur-2xl opacity-70 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
    Expense Tracker
  </span>

  {/* Main text */}
  <span className="relative bg-gradient-to-r from-pink-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
    Expense Tracker
  </span>
</h1>
<p className="text-center text-gray-400 mt-4 text-lg tracking-wide animate-pulse">
  🚀 AI Powered Smart Finance Dashboard
</p>
      </Link>
      <div className="relative mb-10 w-1/2 mx-auto hidden md:block">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
      </div>
    </header>
  );
};

export default Header;
