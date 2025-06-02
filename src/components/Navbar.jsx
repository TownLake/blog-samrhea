// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, IdCard, Activity, ScrollText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants'; // Import ROUTES

const Navbar = ({ toggleSearch }) => {
  const location = useLocation();
  const { pathname } = location;
  const { darkMode, toggleDarkMode } = useTheme();

  const activeClassName = 'text-blue-500 dark:text-blue-400'; // Ensure dark mode active color is good

  return (
    <header className="flex items-center justify-between w-full py-2">
      <Link to={ROUTES.HOME} className="text-2xl font-bold flex items-center">
        Sam Rhea
      </Link>
      <nav className="flex items-center space-x-4">
        <Link
          to={ROUTES.HOME}
          className="flex items-center justify-center w-10 h-10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
          aria-label="Blog Posts"
        >
          <ScrollText
            size={18}
            className={pathname === ROUTES.HOME || pathname.startsWith("/page/") || FILTER_OPTIONS.some(f => pathname.startsWith(ROUTES.FILTER(f.id))) ? activeClassName : ''}
          />
        </Link>
        <Link
          to={ROUTES.ABOUT}
          className="flex items-center justify-center w-10 h-10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
           aria-label="About Me"
        >
          <IdCard
            size={18}
            className={pathname.startsWith(ROUTES.ABOUT) ? activeClassName : ''}
           />
        </Link>
        <Link
          to={ROUTES.DATA} // UPDATED: Link to /data base route
          className="flex items-center justify-center w-10 h-10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
           aria-label="Data Insights" // Updated label
        >
          <Activity
            size={18}
            className={pathname.startsWith(ROUTES.DATA) ? activeClassName : ''} // UPDATED: Check for /data prefix
          />
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