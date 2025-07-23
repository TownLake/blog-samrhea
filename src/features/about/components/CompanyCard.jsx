// src/features/about/components/CompanyCard.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getCompanyType, getThemeVariables } from '../../../utils/themeConfig';
import Card from '../../../components/ui/Card';

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

  const imageContainerClasses = `w-12 h-12 mr-3 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100'
  }`;
   const iconContainerClasses = `w-8 h-8 transition-colors duration-200 ${
    darkMode ? 'text-gray-400' : 'text-gray-500'
  }`;
   const titleClasses = "font-bold text-xl text-[var(--timeline-title-color)] transition-colors duration-200";

  return (
    <div className="relative" style={themeVariables}>
      <Card
        companyType={companyType}
        className={`
            ${darkMode ? 'hover:ring-1 hover:ring-[var(--card-accent-ring)]' : 'hover:shadow-md'}
        `}
      >
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
          <Badge>{company.period}</Badge>
        </div>
        {children}
      </Card>

      {!isLastCompany && (
        <div className={`absolute left-6 top-full w-0.5 h-6 transition-colors duration-200 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
      )}
    </div>
  );
};

export default CompanyCard;
