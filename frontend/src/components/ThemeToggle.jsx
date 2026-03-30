import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="fixed bottom-24 left-4 z-50 w-11 h-11 flex items-center justify-center rounded-full shadow-lg border transition-all duration-300"
      style={{
        backgroundColor: dark ? "#1e293b" : "#ffffff",
        borderColor: dark ? "#334155" : "#e2e8f0",
        boxShadow: dark
          ? "0 0 16px rgba(99,102,241,0.3)"
          : "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      {dark
        ? <FaSun className="text-yellow-400" size={16} />
        : <FaMoon className="text-indigo-500" size={16} />
      }
    </button>
  );
};

export default ThemeToggle;
