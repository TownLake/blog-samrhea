// src/components/Card.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getCompanyType, getThemeVariables, COMPANY_TYPES } from '../utils/themeConfig';

const Card = ({
  children,
  companyType = COMPANY_TYPES.DEFAULT, // Accept companyType
  className = '',
  glossy = true
}) => {
  const { darkMode } = useTheme(); // Gets darkMode from context
  // Calculate theme variables using darkMode from context
  const themeVariables = getThemeVariables(companyType, darkMode);

  const glossyGradient = `bg-gradient-to-tr from-[var(--card-gradient-from)] via-[var(--card-gradient-via)] to-[var(--card-gradient-to)]`;

  return (
    <div
      style={themeVariables} // Apply CSS variables here
      // Use Tailwind arbitrary properties to reference CSS variables
      className={`
        rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl
        bg-[var(--card-bg)]
        border border-[var(--card-border)]
        transition-colors duration-200
        ${/* CORRECTED: Use 'darkMode' from context here */ ''}
        ${darkMode && companyType !== COMPANY_TYPES.DEFAULT ? 'ring-1 ring-[var(--card-accent-ring)]' : ''}
        ${className}
      `}
    >
      {/* Glossy effect overlay */}
      {glossy && (
        <div
           className={`absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl ${glossyGradient}`}
        ></div>
      )}

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;