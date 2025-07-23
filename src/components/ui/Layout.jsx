// src/components/ui/Layout.jsx
import React from 'react';
import Navbar from '/src/components/ui/Navbar.jsx';
import FloatingNav from '/src/components/ui/FloatingNav.jsx';

const Layout = ({ children, toggleSearch }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container max-w-2xl mx-auto px-5 sm:px-6 py-6">
        <Navbar toggleSearch={toggleSearch} />
        <main className="pb-32">{children}</main>
      </div>
      <FloatingNav />
    </div>
  );
};

export default Layout;