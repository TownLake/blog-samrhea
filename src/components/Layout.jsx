// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, toggleSearch }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container max-w-2xl mx-auto px-5 sm:px-6 py-6">
        <Navbar toggleSearch={toggleSearch} />
        {/* Add padding to the bottom of main to prevent overlap with a potential FloatingNav */}
        <main className="pb-24">{children}</main>
      </div>
    </div>
  );
};

export default Layout;