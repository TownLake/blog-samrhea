// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants';

const Navbar = ({ toggleSearch }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to={ROUTES.HOME} className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-2 sm:space-x-4">
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