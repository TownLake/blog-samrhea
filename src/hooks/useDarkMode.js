// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';
import { STORAGE_KEYS, EVENTS } from '../constants';

// Export the event name for consistency
export const DARK_MODE_CHANGE_EVENT = EVENTS.DARK_MODE_CHANGE;

export default function useDarkMode() {
  // Get initial state: use stored preference if available; otherwise, use system setting.
  const getInitialDarkMode = () => {
    if (typeof window !== 'undefined') {
      const storedPref = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (storedPref) {
        return storedPref === 'dark';
      } else {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  };

  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Update the document and localStorage whenever darkMode changes.
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'light');
    }
    
    // Dispatch a custom event so other components can react to dark mode changes
    window.dispatchEvent(new CustomEvent(DARK_MODE_CHANGE_EVENT, { detail: { darkMode } }));
  }, [darkMode]);

  // Listen to system theme changes.
  useEffect(() => {
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

    return () => {
      mediaQuery.removeEventListener('change', systemPreferenceListener);
    };
  }, []);

  // Listen for dark mode changes from other components
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setDarkMode(event.detail.darkMode);
    };

    window.addEventListener(DARK_MODE_CHANGE_EVENT, handleDarkModeChange);
    
    return () => {
      window.removeEventListener(DARK_MODE_CHANGE_EVENT, handleDarkModeChange);
    };
  }, []);

  // Toggling dark mode updates the state (and saves the explicit preference).
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return [darkMode, toggleDarkMode];
}