// src/components/CareerTimeline.jsx
import React, { useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import CompanyCard from './CompanyCard';
import TimelineRole from './TimelineRole';
import { getCompanyType, COMPANY_TYPES, getThemeVariables } from '../utils/themeConfig';

// Import the data from JSON files
import companyData from '../data/careerExperience.json';
import educationData from '../data/education.json';

/**
 * Career timeline component loading data from external JSON
 */
const CareerTimeline = () => {
  const { darkMode } = useTheme();

  // Memoized render function for achievements (handles complex structures)
  const renderAchievement = useCallback((achievement) => {
    if (typeof achievement === 'string') {
      return achievement;
    } else if (Array.isArray(achievement)) {
      return achievement.map((part, index) => {
        if (typeof part === 'string') {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        } else if (part && typeof part === 'object' && part.text && part.link) {
          return (
            <a
              key={index}
              href={part.link}
              target="_blank"
              rel="noopener noreferrer"
              className="custom-link"
            >
              {part.text}
            </a>
          );
        }
        return null;
      });
    }
    return null;
  }, []);

  // Section list component for education details
  const SectionList = useCallback(({ sections, companyName = '' }) => {
    const companyType = getCompanyType(companyName);
    const themeVariables = getThemeVariables(companyType, darkMode);

    const getTitleClass = () => {
        return 'text-[var(--timeline-title-color)]'; // Use CSS variable
    };

    return (
      <div className="mt-6 pl-6" style={themeVariables}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <h4 className={`font-semibold mb-2 ${getTitleClass()}`}>
              {section.title}
            </h4>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start text-wrap-pretty" style={{ letterSpacing: '-0.01em' }}>
                  <span className={`achievement-bullet ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                   }`}>•</span>
                  <span>
                    {typeof item === 'object' && item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="custom-link"
                      >
                        {item.text}
                      </a>
                    ) : item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }, [darkMode]);

  // Intro text remains hardcoded as it's specific prose for this page
  const introText = "I work on the Emerging Technology and Incubation team at Cloudflare. We ship the future that we think our customers will need months and years from now. I spent the previous six years launching, building, and leading the Zero Trust product line at Cloudflare as the VP of Product. I shipped the first prototype in that group into GA as a Product Manager in 2018. A few years later we became the only new vendor in the Gartner Magic Quadrant. Before that I launched our Registrar.";

  // --- Removed hardcoded companyData and educationData arrays ---

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]" style={{ letterSpacing: '-0.025em' }}>At Work</h1>
        <p className="text-lg text-[var(--text-secondary)]"
           style={{ letterSpacing: '-0.01em', lineHeight: '1.75', textWrap: 'pretty' }}>
          {introText}
        </p>
      </div>

      {/* Work experience - Map over imported companyData */}
      <div className="space-y-6">
        {companyData.map((company, companyIndex) => (
          <CompanyCard
            key={company.id}
            company={company}
            isLastCompany={companyIndex === companyData.length - 1}
          >
            <div className="mt-4 space-y-4 pl-2">
              {company.roles.map((role, roleIndex) => (
                <TimelineRole
                  key={role.id}
                  role={role}
                  companyType={getCompanyType(company.name)}
                  isLastRole={roleIndex === company.roles.length - 1}
                  renderAchievement={renderAchievement} // Pass the render function
                />
              ))}
            </div>
          </CompanyCard>
        ))}

        {/* Education section - Map over imported educationData */}
        {educationData.map((education) => (
          <CompanyCard
            key={education.id}
            company={education}
            isLastCompany={true} // Assuming education is always last
          >
            <div className="mt-4 space-y-4 pl-2">
              {education.roles.map((role, roleIndex) => (
                // Pass companyType to TimelineRole
                <TimelineRole
                  key={role.id}
                  role={role}
                  companyType={getCompanyType(education.name)}
                  isLastRole={roleIndex === education.roles.length - 1}
                  renderAchievement={renderAchievement} // Pass the render function
                />
              ))}
            </div>

            {/* SectionList for additional education details */}
            {education.sections && education.sections.length > 0 && (
              <SectionList
                sections={education.sections}
                companyName={education.name}
              />
            )}
          </CompanyCard>
        ))}
      </div>
    </div>
  );
};

export default CareerTimeline;