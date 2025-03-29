// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import useDarkMode from '../hooks/useDarkMode';

const Layout = ({ children, toggleSearch }) => {
  const [darkMode, toggleDarkMode] = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container max-w-2xl mx-auto px-5 sm:px-6 py-6">
        <Navbar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          toggleSearch={toggleSearch} // Pass the toggleSearch prop here
        />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
