// src/components/TimelineRole.jsx

import React from 'react';
import { getTimelineColors, getTextStyles, ELEMENT_STYLES } from '../utils/themeConfig';

/**
 * Timeline role component for displaying individual positions within a company
 * With improved dark mode styling
 */
const TimelineRole = ({ 
  role, 
  companyType, 
  isDarkMode, 
  isLastRole = false,
  renderAchievement 
}) => {
  // Get appropriate colors from the theme config
  const colors = getTimelineColors(companyType, isDarkMode);
  const textStyles = getTextStyles(isDarkMode);
  
  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${colors.dot} shadow-sm`}></div>
      
      {/* Timeline vertical line */}
      {!isLastRole && (
        <div className={`absolute left-1.5 top-4 w-[1px] h-full -mb-4 ${colors.line}`}></div>
      )}
      
      {/* Role content */}
      <div className="pl-5">
        <h3 className={`font-semibold text-lg mb-1 ${colors.title}`}>
          {role.title}
        </h3>
        
        <p className={`text-sm mb-2 ${textStyles.muted}`}>
          {role.period}
        </p>
        
        {/* Role achievements */}
        {role.achievements && role.achievements.length > 0 && (
          <ul className={`space-y-1 text-sm ${textStyles.secondary}`}>
            {role.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start text-wrap-pretty" style={{ letterSpacing: '-0.01em' }}>
                <span className={`${ELEMENT_STYLES.bullet} ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
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