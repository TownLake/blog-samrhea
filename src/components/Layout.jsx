// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer'; // Import the new Footer component

const Layout = ({ children, toggleSearch }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container max-w-2xl mx-auto px-5 sm:px-6 py-6 flex-grow"> {/* Added flex-grow */}
        <Navbar toggleSearch={toggleSearch} />
        <main className="flex-grow">{children}</main> {/* Added flex-grow */}
      </div>
      {/* Add Footer outside the main container's padding but still constrained */}
      <div className="container max-w-2xl mx-auto px-5 sm:px-6">
         <Footer />
      </div>
    </div>
  );
};

export default Layout;