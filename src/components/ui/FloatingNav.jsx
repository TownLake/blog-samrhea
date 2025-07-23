// src/components/ui/FloatingNav.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_MAP, PRIMARY_NAV_SECTIONS } from '/src/constants';

const FloatingNav = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const { pathname } = location;
  
  const primarySectionKey = 
    pathname.startsWith('/data') ? 'data' :
    pathname.startsWith('/about') ? 'about' : 'blog';
  
  const currentPrimarySection = NAVIGATION_MAP[primarySectionKey];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navRef]);

  const handlePrimaryNavClick = (path) => {
    setIsExpanded(false);
    setTimeout(() => navigate(path), 150);
  };

  return (
    <div ref={navRef} className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex justify-center mb-5 px-4">
      <div className="relative">
        <div 
          className={`absolute bottom-full mb-3 flex flex-col items-start gap-1 p-2 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-in-out origin-bottom-left ${
            isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {PRIMARY_NAV_SECTIONS.map(primaryOption => {
            const isActive = primaryOption.id === primarySectionKey;
            return (
              <button
                key={primaryOption.id}
                onClick={() => handlePrimaryNavClick(primaryOption.path)}
                className={`w-full flex items-center gap-4 text-left px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300' : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{primaryOption.icon}</span>
                <span>{primaryOption.label}</span>
              </button>
            );
          })}
        </div>

        <nav className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle main navigation"
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">{currentPrimarySection.contextIcon}</span>
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />

          <div className="flex items-center gap-1">
            {currentPrimarySection.subnav.map((option) => (
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
          </div>
        </nav>
      </div>
    </div>
  );
};

export default FloatingNav;