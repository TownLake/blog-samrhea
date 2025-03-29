import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Ensure this path is correct
import { getCompanyType, getThemeVariables, COMPANY_TYPES } from '../utils/themeConfig'; // Ensure this path is correct

const Card = ({
  children,
  companyType = COMPANY_TYPES.DEFAULT, // Accept companyType
  className = '',
  glossy = true,
  onClick, // *** ADDED: Accept onClick prop ***
  ...rest // *** ADDED: Accept any other standard div props (like aria-*, data-*, etc.) ***
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
        ${darkMode && companyType !== COMPANY_TYPES.DEFAULT ? 'ring-1 ring-[var(--card-accent-ring)]' : ''}
        ${className}
      `}
      onClick={onClick} // *** ADDED: Apply onClick handler to the root div ***
      {...rest} // *** ADDED: Spread remaining props onto the root div ***
    >
      {/* Glossy effect overlay */}
      {glossy && (
        <div
           className={`absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl ${glossyGradient}`}
           aria-hidden="true" // Hide decorative element from screen readers
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