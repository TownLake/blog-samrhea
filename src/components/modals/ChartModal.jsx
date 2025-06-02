// src/components/modals/ChartModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ChartModal = ({
  isOpen,
  onClose,
  title,
  icon: IconComponent, // Optional: Icon to display next to the title
  headerActions,      // Optional: React node for extra actions in the header (e.g., toggle buttons)
  children
}) => {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const modalBackgroundClass = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColorClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  // Muted text for icon if needed, can be adjusted
  const iconColorClass = darkMode ? 'text-slate-400' : 'text-slate-500';


  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div
        className={`${modalBackgroundClass} ${textColorClass} rounded-xl w-full max-w-3xl shadow-2xl border ${borderColorClass} flex flex-col overflow-hidden`}
        style={{ maxHeight: 'calc(100vh - 4rem)' }} // Ensure modal doesn't exceed viewport height
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-5 border-b ${borderColorClass} flex-shrink-0`}>
          <div className="flex items-center gap-2 min-w-0">
            {IconComponent && <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />}
            <h2 id={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`} className="text-lg sm:text-xl font-semibold truncate">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {headerActions} {/* Render custom header actions here */}
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content - Chart or other children will go here */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;