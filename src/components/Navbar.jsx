import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, IdCard, Activity, ScrollText } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode, toggleSearch }) => {
  const location = useLocation();
  
  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to="/" className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
        >
          <ScrollText size={18} />
        </Link>
        <Link
          to="/about"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
        >
          <IdCard size={18} />
        </Link>
        <Link
          to="/health"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
        >
          <Activity size={18} />
        </Link>
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-10 h-10"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={toggleSearch}
          className="flex items-center justify-center w-10 h-10"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </nav>
    </header>
  );
};

export default Navbar;