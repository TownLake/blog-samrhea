// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, IdCard, Activity, ScrollText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

// Removed darkMode and toggleDarkMode props
const Navbar = ({ toggleSearch }) => {
  const location = useLocation();
  const { pathname } = location; // Get the current pathname
  // Get theme state and toggle function from context
  const { darkMode, toggleDarkMode } = useTheme();

  // Define the active class - adjust 'text-blue-500' if your theme uses a different blue shade (e.g., text-blue-600)
  const activeClassName = 'text-blue-500'; // <--- Your theme's blue class

  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to="/" className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
          aria-label="Blog Posts"
        >
          {/* Apply active class conditionally */}
          <ScrollText
            size={18}
            className={pathname === '/' ? activeClassName : ''}
          />
        </Link>
        <Link
          to="/about"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
           aria-label="About Me"
        >
           {/* Apply active class conditionally using startsWith for sub-routes */}
          <IdCard
            size={18}
            className={pathname.startsWith('/about') ? activeClassName : ''}
           />
        </Link>
        <Link
          to="/health"
          className="flex items-center justify-center w-10 h-10 hover:underline text-sm"
           aria-label="Health Data"
        >
           {/* Apply active class conditionally using startsWith for sub-routes */}
          <Activity
            size={18}
            className={pathname.startsWith('/health') ? activeClassName : ''}
          />
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