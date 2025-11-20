// src/components/ui/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '/src/context/ThemeContext.js';
import { ROUTES } from '/src/constants';

const Navbar = ({ toggleSearch }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to={ROUTES.HOME} className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-2 sm:space-x-4">
        <Link
          to={ROUTES.ABOUT}
          className="flex items-center justify-center w-10 h-10 text-2xl hover:scale-110 transition-transform"
          aria-label="About"
          title="About"
        >
          👋
        </Link>
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={toggleSearch}
          className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </nav>
    </header>
  );
};

export default Navbar;