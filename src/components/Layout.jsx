// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
// No longer needs useDarkMode or to manage dark mode state itself

// Removed darkMode and toggleDarkMode props
const Layout = ({ children, toggleSearch }) => {
  // The 'dark' class is now applied to <html> by the hook via ThemeProvider
  // Layout itself doesn't need direct access unless styling its own elements
  return (
    // Apply base background/text colors here, reacting to the 'dark' class on <html>
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container max-w-2xl mx-auto px-5 sm:px-6 py-6">
        {/* Pass only necessary props like toggleSearch to Navbar */}
        <Navbar toggleSearch={toggleSearch} />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;