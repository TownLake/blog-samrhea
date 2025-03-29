// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants'; // Removed EVENTS constant

// NOTE: Removed DARK_MODE_CHANGE_EVENT export

// Renamed hook to avoid naming conflict if imported in ThemeProvider.jsx
export default function useDarkModeInternal() {
  // Get initial state: use stored preference if available; otherwise, use system setting.
  const getInitialDarkMode = () => {
    if (typeof window !== 'undefined') {
      const storedPref = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (storedPref) {
        return storedPref === 'dark';
      } else {
        // Check for window.matchMedia existence before calling matches
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false; // Default to false if window is not available (SSR)
  };

  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Update the document and localStorage whenever darkMode changes.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'light');
      }
      // --- Removed CustomEvent dispatch ---
    }
  }, [darkMode]);

  // Listen to system theme changes.
  useEffect(() => {
    // Ensure window and matchMedia are available
    if (typeof window === 'undefined' || !window.matchMedia) {
        return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const systemPreferenceListener = (e) => {
      // Only update darkMode if there's no explicit user preference saved.
      const storedPref = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (!storedPref) {
        setDarkMode(e.matches);
      }
    };

    // Modern browsers support addEventListener on media queries.
    mediaQuery.addEventListener('change', systemPreferenceListener);

    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener('change', systemPreferenceListener);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Removed listener for DARK_MODE_CHANGE_EVENT ---

  // Toggling dark mode updates the state (and saves the explicit preference).
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Return the state and the toggle function
  return [darkMode, toggleDarkMode];
}