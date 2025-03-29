// src/context/ThemeProvider.jsx
import React from 'react';
import ThemeContext from './ThemeContext';
import useDarkModeInternal from '../hooks/useDarkMode'; // Rename original hook import

// The ThemeProvider component
const ThemeProvider = ({ children }) => {
  // Use the actual dark mode logic from the hook
  const [darkMode, toggleDarkMode] = useDarkModeInternal();

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;