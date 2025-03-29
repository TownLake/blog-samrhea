// src/components/Card.jsx

import React from 'react';
import useDarkMode from '../hooks/useDarkMode';
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
  const [isDarkMode] = useDarkMode();
  
  // Get the appropriate color scheme from the centralized theme config
  const currentScheme = getCardStyles(companyType, isDarkMode);
  
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