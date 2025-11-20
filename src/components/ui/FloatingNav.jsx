// src/components/ui/FloatingNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_MAP } from '/src/constants';

const FloatingNav = () => {
  const blogSection = NAVIGATION_MAP.blog;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex justify-center mb-5 px-4">
      <nav className="flex items-center gap-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-1.5">
        {blogSection.subnav.map((option) => (
          <NavLink
            key={option.id}
            to={option.path}
            end
            aria-label={option.label}
            className={({ isActive }) => `flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-200 ${
              isActive ? 'bg-blue-500/10 dark:bg-blue-400/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{option.icon}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default FloatingNav;