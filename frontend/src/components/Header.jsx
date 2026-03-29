import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "🏠 Dashboard" },
  { to: "/analytics", label: "📊 Analytics" },
  { to: "/planning", label: "💰 Planning" },
];

const Header = () => {
  return (
    <header className="py-8 z-10 relative">
      <Link to="/">
        <h1 className="relative text-5xl md:text-7xl font-black text-center tracking-widest">
          <span className="absolute inset-0 blur-2xl opacity-70 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Expense Tracker
          </span>
          <span className="relative bg-gradient-to-r from-pink-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
            Expense Tracker
          </span>
        </h1>
        <p className="text-center text-gray-400 mt-3 text-base tracking-wide animate-pulse">
          🚀 AI Powered Smart Finance Dashboard
        </p>
      </Link>

      {/* Nav */}
      <nav className="flex justify-center gap-2 mt-6">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="relative mb-6 mt-6 w-1/2 mx-auto hidden md:block">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
      </div>
    </header>
  );
};

export default Header;
