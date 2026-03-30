import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Notifications from "./Notifications";
import { useQuery } from "@apollo/client";
import { GET_AUTH_USER } from "../graphql/queries/user.query";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";

const navLinks = [
  { to: "/",             label: "🏠 Dashboard" },
  { to: "/transactions", label: "💳 Transactions" },
  { to: "/analytics",    label: "📊 Analytics" },
  { to: "/planning",     label: "💰 Planning" },
  { to: "/profile",      label: "👤 Profile" },
];

const NavItem = ({ to, label, onClick }) => (
  <NavLink to={to} end={to === "/"} onClick={onClick}
    className={({ isActive }) =>
      `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
          : "bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white"
      }`
    }>
    {label}
  </NavLink>
);

const Header = () => {
  const { data } = useQuery(GET_AUTH_USER);
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = data?.authUser;

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff&bold=true&size=64`;

  return (
    <header className="py-6 z-10 relative px-4">
      {/* Title */}
      <Link to="/">
        <h1 className="relative text-4xl md:text-6xl font-black text-center tracking-widest">
          <span className="absolute inset-0 blur-2xl opacity-70 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Expense Tracker
          </span>
          <span className="relative bg-gradient-to-r from-pink-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
            Expense Tracker
          </span>
        </h1>
        <p className="text-center text-gray-400 mt-2 text-sm tracking-wide animate-pulse">
          🚀 AI Powered Smart Finance Dashboard
        </p>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center justify-center gap-3 mt-5">
        <nav className="flex gap-2 flex-wrap justify-center">
          {navLinks.map(({ to, label }) => <NavItem key={to} to={to} label={label} />)}
        </nav>
        <div className="flex items-center gap-2 ml-2">
          <Notifications />
          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">
            {dark ? <FaSun className="text-yellow-400" size={14} /> : <FaMoon className="text-indigo-400" size={14} />}
          </button>
          {user && (
            <Link to="/profile">
              <img
                src={user.profilePic || fallback}
                alt="avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
                className="w-9 h-9 rounded-xl border-2 border-slate-700 hover:border-indigo-500 transition object-cover"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Notifications />
          <button onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
            {dark ? <FaSun className="text-yellow-400" size={14} /> : <FaMoon className="text-indigo-400" size={14} />}
          </button>
        </div>
        <button onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-gray-400">
          {menuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 bg-slate-800 border border-slate-700 rounded-2xl p-3 flex flex-col gap-1 shadow-xl">
          {navLinks.map(({ to, label }) => (
            <NavItem key={to} to={to} label={label} onClick={() => setMenuOpen(false)} />
          ))}
        </div>
      )}

      <div className="relative mb-4 mt-5 w-1/2 mx-auto hidden md:block">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
      </div>
    </header>
  );
};

export default Header;
