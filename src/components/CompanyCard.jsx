// src/components/CompanyCard.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getCompanyType, getThemeVariables, COMPANY_TYPES } from '../utils/themeConfig';

// Reusable Badge component internal to CompanyCard or moved to its own file
const Badge = ({ children }) => {
    return (
        <span
            className={`
                text-sm font-medium rounded-full px-3 py-1 flex-shrink-0
                bg-[var(--badge-bg)] text-[var(--badge-text)]
                border border-[var(--badge-border)]
                transition-colors duration-200
            `}
        >
            {children}
        </span>
    );
};


const CompanyCard = ({
  company,
  children,
  isLastCompany = false
}) => {
  const { darkMode } = useTheme();
  const companyType = getCompanyType(company.name);
  const themeVariables = getThemeVariables(companyType, darkMode);

  const cardBaseClasses = "rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl transition-all duration-200";
  const glossyOverlayClasses = "absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl bg-gradient-to-tr from-[var(--card-gradient-from)] via-[var(--card-gradient-via)] to-[var(--card-gradient-to)]";
  const contentContainerClasses = "relative z-10";
  const imageContainerClasses = `w-12 h-12 mr-3 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100' // General dark/light for image bg
  }`;
   const iconContainerClasses = `w-8 h-8 transition-colors duration-200 ${
    darkMode ? 'text-gray-400' : 'text-gray-500' // General dark/light for icon
  }`;
   const titleClasses = "font-bold text-xl text-[var(--timeline-title-color)] transition-colors duration-200"; // Use timeline title color

  return (
    // Apply theme variables to the root element
    <div className="relative" style={themeVariables}>
      <div
        className={`
            ${cardBaseClasses}
            bg-[var(--card-bg)] border border-[var(--card-border)]
            ${darkMode ? 'hover:ring-1 hover:ring-[var(--card-accent-ring)]' : 'hover:shadow-md'}
        `}
      >
        {/* Glossy effect overlay - uses variables from parent style */}
        <div className={glossyOverlayClasses}></div>

        {/* Content */}
        <div className={contentContainerClasses}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className={imageContainerClasses}>
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Briefcase className={iconContainerClasses} />
                )}
              </div>
              <h2 className={titleClasses}>
                {company.name}
              </h2>
            </div>
             {/* Use Badge component which reads CSS vars */}
            <Badge>{company.period}</Badge>
          </div>

          {children}
        </div>
      </div>

      {/* Company connector line - General dark/light styling */}
      {!isLastCompany && (
        <div className={`absolute left-6 top-full w-0.5 h-6 transition-colors duration-200 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
      )}
    </div>
  );
};

export default CompanyCard;