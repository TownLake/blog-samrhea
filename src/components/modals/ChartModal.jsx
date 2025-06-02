// src/components/modals/ChartModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // To style based on theme

const ChartModal = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const modalBackgroundClass = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColorClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedTextColorClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title}`}
    >
      <div
        className={`${modalBackgroundClass} ${textColorClass} rounded-xl w-full max-w-3xl shadow-2xl border ${borderColorClass} flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${borderColorClass}`}>
          <h2 id={`modal-title-${title}`} className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400`}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Chart will go here */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;