// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, IdCard, Activity, ScrollText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

// Removed darkMode and toggleDarkMode props
const Navbar = ({ toggleSearch }) => {
  const location = useLocation();
  // Get theme state and toggle function from context
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to="/" className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
          aria-label="Blog Posts" // Added aria-label for accessibility
        >
          <ScrollText size={18} />
        </Link>
        <Link
          to="/about"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
           aria-label="About Me" // Added aria-label
        >
          <IdCard size={18} />
        </Link>
        <Link
          to="/health"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
           aria-label="Health Data" // Added aria-label
        >
          <Activity size={18} />
        </Link>
        <button
          onClick={toggleDarkMode} // Use toggle function from context
          aria-label="Toggle theme"
          className="flex items-center justify-center w-10 h-10"
        >
          {/* Use darkMode state from context */}
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