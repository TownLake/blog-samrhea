// src/components/Card.jsx
import React from 'react';
// Removed internal useDarkMode import
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook
import { getCardStyles, COMPANY_TYPES } from '../utils/themeConfig';

/**
 * Reusable card component with theming support
 */
const Card = ({
  children,
  companyType = COMPANY_TYPES.DEFAULT,
  className = '',
  glossy = true
}) => {
  // Get darkMode state from context instead of the hook directly
  const { darkMode } = useTheme();

  // Get the appropriate color scheme from the centralized theme config
  // Pass the darkMode state from context to the utility function
  const currentScheme = getCardStyles(companyType, darkMode);

  return (
    <div
      className={`rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl ${currentScheme.background} border ${currentScheme.border} ${className}`}
    >
      {/* Glossy effect overlay */}
      {glossy && (
        <div className={`absolute -inset-0.5 ${currentScheme.gradient} backdrop-blur-md z-0 rounded-2xl`}></div>
      )}

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;