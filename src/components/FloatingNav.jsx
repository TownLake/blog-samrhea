// src/components/FloatingNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const FloatingNav = ({ options, currentOption, useNavLink, onOptionClick, basePath = '' }) => {
  // Gracefully handle missing options to prevent crashes
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center mb-5 px-4">
      <nav className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-1.5">
        {options.map((option) => {
          const content = (
            <span className="text-2xl">{option.icon}</span>
          );

          const baseClasses = 'flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-200';
          const activeClasses = 'bg-blue-500/10 dark:bg-blue-400/20';
          const inactiveClasses = 'hover:bg-black/5 dark:hover:bg-white/10';

          if (useNavLink) {
            return (
              <NavLink
                key={option.id}
                to={`${basePath}/${option.id}`}
                aria-label={option.label}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                }
              >
                {content}
              </NavLink>
            );
          }

          const isActive = option.id === currentOption;
          return (
            <button
              key={option.id}
              onClick={() => onOptionClick(option.id)}
              aria-label={option.label}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FloatingNav;