// src/components/TimelineRole.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getThemeVariables, getCompanyType } from '../utils/themeConfig'; // Don't need COMPANY_TYPES here

const TimelineRole = ({
  role,
  companyType, // Receive companyType
  isLastRole = false,
  renderAchievement
}) => {
  const { darkMode } = useTheme();
  // Get variables based on companyType passed down
  const themeVariables = getThemeVariables(companyType, darkMode);

  return (
    // Apply theme variables here if needed, or rely on parent (CompanyCard)
    // Let's assume CompanyCard sets the scope, so we just read vars
    <div className="relative">
      {/* Timeline dot - Use CSS var */}
      <div
        className={`
            absolute left-0 top-1.5 w-3 h-3 rounded-full shadow-sm
            bg-[var(--timeline-dot-color)]
            transition-colors duration-200
        `}
      ></div>

      {/* Timeline vertical line - Use CSS var */}
      {!isLastRole && (
        <div
            className={`
                absolute left-1.5 top-4 w-[1px] h-full -mb-4
                bg-[var(--timeline-line-color)]
                transition-colors duration-200
            `}
        ></div>
      )}

      {/* Role content */}
      <div className="pl-5">
        <h3
            className={`
                font-semibold text-lg mb-1
                text-[var(--timeline-title-color)]
                transition-colors duration-200
            `}
        >
          {role.title}
        </h3>

        {/* Use global text muted variable */}
        <p className="text-sm mb-2 text-[var(--text-muted)] transition-colors duration-200">
          {role.period}
        </p>

        {/* Role achievements */}
        {role.achievements && role.achievements.length > 0 && (
           // Use global text secondary variable
          <ul className="space-y-1 text-sm text-[var(--text-secondary)] transition-colors duration-200">
            {role.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start text-wrap-pretty" style={{ letterSpacing: '-0.01em' }}>
                 {/* General dark/light styling for bullet */}
                <span className={`achievement-bullet ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>•</span>
                <span>{renderAchievement(achievement)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TimelineRole;