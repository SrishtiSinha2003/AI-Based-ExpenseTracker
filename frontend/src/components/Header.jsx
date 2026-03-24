import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="py-10 z-10 relative">
      <Link to="/">
        <h1 className="text-center text-7xl font-bold mb-6">Expense Tracker</h1>
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
