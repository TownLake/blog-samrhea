// src/components/CompanyCard.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook
import {
  getCompanyType,
  getCardStyles,
  getTimelineColors,
  getBadgeStyles,
  ELEMENT_STYLES
} from '../utils/themeConfig';

/**
 * Company or institution card for timeline displays
 * Using centralized theme configuration with improved dark mode
 */
const CompanyCard = ({
  company,
  // removed isDarkMode prop
  children,
  isLastCompany = false
}) => {
  // Get darkMode state from context
  const { darkMode } = useTheme();

  // Get company type from centralized function
  const companyType = getCompanyType(company.name);

  // Get styles from theme config, passing darkMode from context
  const cardStyles = getCardStyles(companyType, darkMode);
  const titleColor = getTimelineColors(companyType, darkMode).title;
  const badgeClass = getBadgeStyles(darkMode);

  // Add hover effect for better interactivity
  const hoverEffect = darkMode ? cardStyles.hover : 'hover:shadow-md hover:border-opacity-80';

  return (
    <div className="relative">
      <div className={`${ELEMENT_STYLES.cardContainer} ${cardStyles.background} border ${cardStyles.border} ${cardStyles.accent} ${hoverEffect}`}>
        {/* Glossy effect overlay */}
        <div className={`${ELEMENT_STYLES.glossyOverlay} ${cardStyles.gradient}`}></div>

        {/* Content */}
        <div className={ELEMENT_STYLES.contentContainer}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className={`${ELEMENT_STYLES.imageContainer} ${
                // Use darkMode from context for conditional styling
                darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100'
              }`}>
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Briefcase className={`${ELEMENT_STYLES.iconContainer} ${
                    // Use darkMode from context for conditional styling
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </div>
              <h2 className={`${ELEMENT_STYLES.title} ${titleColor}`}>
                {company.name}
              </h2>
            </div>
            <span className={`${ELEMENT_STYLES.badgeContainer} ${badgeClass}`}>
              {company.period}
            </span>
          </div>

          {children}
        </div>
      </div>

      {/* Company connector line for timeline effect */}
      {!isLastCompany && (
        <div className={`absolute left-6 top-full w-0.5 h-6 ${
          // Use darkMode from context for conditional styling
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
      )}
    </div>
  );
};

export default CompanyCard;