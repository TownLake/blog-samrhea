// src/components/ui/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, goToPage }) => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      {currentPage > 1 && (
        <button 
          onClick={() => goToPage(currentPage - 1)}
          className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 text-sm"
        >
          ← Previous
        </button>
      )}
      
      <span className="px-3 py-1 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      {currentPage < totalPages && (
        <button 
          onClick={() => goToPage(currentPage + 1)}
          className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 text-sm"
        >
          Next →
        </button>
      )}
    </div>
  );
};

export default Pagination;