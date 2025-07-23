// src/components/ui/Card.jsx
import React from 'react';
import { useTheme } from '/src/context/ThemeContext.js';
import { getThemeVariables, COMPANY_TYPES } from '/src/utils/themeConfig.js';

const Card = ({
  children,
  companyType = COMPANY_TYPES.DEFAULT,
  className = '',
  glossy = true,
  onClick,
  ...rest
}) => {
  const { darkMode } = useTheme();
  const themeVariables = getThemeVariables(companyType, darkMode);

  const glossyGradient = `bg-gradient-to-tr from-[var(--card-gradient-from)] via-[var(--card-gradient-via)] to-[var(--card-gradient-to)]`;

  return (
    <div
      style={themeVariables}
      className={`
        rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl
        bg-[var(--card-bg)]
        border border-[var(--card-border)]
        transition-colors duration-200
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {glossy && (
        <div
           className={`absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl ${glossyGradient}`}
           aria-hidden="true"
        ></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;