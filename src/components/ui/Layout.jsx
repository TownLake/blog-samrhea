// src/components/ui/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '/src/components/ui/Navbar.jsx';
import FloatingNav from '/src/components/ui/FloatingNav.jsx';

const Layout = ({ children, toggleSearch }) => {
  const location = useLocation();
  const isBlogPage = !location.pathname.startsWith('/about') && !location.pathname.startsWith('/post/');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <Navbar toggleSearch={toggleSearch} />
        <main className={isBlogPage ? "pb-32" : "pb-12"}>{children}</main>
      </div>
      {isBlogPage && <FloatingNav />}
    </div>
  );
};

export default Layout;