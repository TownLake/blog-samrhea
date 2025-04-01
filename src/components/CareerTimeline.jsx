// src/components/CareerTimeline.jsx
import React, { useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import CompanyCard from './CompanyCard'; // Used for consistency
import TimelineRole from './TimelineRole'; // Keep if needed elsewhere, but not directly for patents
import { getCompanyType, COMPANY_TYPES, getThemeVariables } from '../utils/themeConfig';
import { Award, ExternalLink } from 'lucide-react'; // Import icons

// Import the data from JSON files
import companyData from '../data/careerExperience.json';
import educationData from '../data/education.json';
import patentsData from '../data/patents.json'; // Import patent data

/**
 * Career timeline component loading data from external JSON, including patents
 */
const CareerTimeline = () => {
  const { darkMode } = useTheme();

  // Render function for complex achievement strings (links, etc.)
  const renderAchievement = useCallback((achievement) => {
    // ... (same implementation as before)
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
    // ... (same implementation as before)
    const companyType = getCompanyType(companyName);
    const themeVariables = getThemeVariables(companyType, darkMode);

    const getTitleClass = () => 'text-[var(--timeline-title-color)]';

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
                  <span className={`achievement-bullet ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>•</span>
                  <span>
                    {typeof item === 'object' && item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="custom-link">{item.text}</a>
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

  // Intro text
  const introText = "I work in the Research group at Cloudflare. We ship the future that we think our customers will need months and years from now. I spent the previous six years launching, building, and leading the Zero Trust product line at Cloudflare as the VP of Product.";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]" style={{ letterSpacing: '-0.025em' }}>At Work</h1>
        <p className="text-lg text-[var(--text-secondary)]" style={{ letterSpacing: '-0.01em', lineHeight: '1.75', textWrap: 'pretty' }}>
          {introText}
        </p>
      </div>

      {/* --- Work Experience Section --- */}
      {/* (Renders CompanyCard using companyData - no changes needed here) */}
      <div className="space-y-6">
         {companyData.map((company, companyIndex) => (
             <CompanyCard key={company.id} company={company} isLastCompany={companyIndex === companyData.length - 1}>
                 <div className="mt-4 space-y-4 pl-2">
                 {company.roles.map((role, roleIndex) => (
                     <TimelineRole key={role.id} role={role} companyType={getCompanyType(company.name)} isLastRole={roleIndex === company.roles.length - 1} renderAchievement={renderAchievement}/>
                 ))}
                 </div>
             </CompanyCard>
         ))}
      </div>


      {/* --- Education Section --- */}
      {/* (Renders CompanyCard using educationData - no changes needed here) */}
      <div className="space-y-6 mt-12"> {/* Added margin-top */}
         <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)] border-b pb-2">Education</h2> {/* Section Title */}
         {educationData.map((education) => (
             <CompanyCard key={education.id} company={education} isLastCompany={true}>
                 <div className="mt-4 space-y-4 pl-2">
                     {education.roles.map((role, roleIndex) => (
                         <TimelineRole key={role.id} role={role} companyType={getCompanyType(education.name)} isLastRole={roleIndex === education.roles.length - 1} renderAchievement={renderAchievement}/>
                     ))}
                 </div>
                 {education.sections && education.sections.length > 0 && (
                     <SectionList sections={education.sections} companyName={education.name}/>
                 )}
             </CompanyCard>
         ))}
      </div>


      {/* --- NEW: Patents Section --- */}
      {patentsData && patentsData.length > 0 && (
        <div className="space-y-6 mt-12"> {/* Added margin-top */}
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)] border-b pb-2">Patents</h2> {/* Section Title */}
          {patentsData.map((patent) => {
            // Use the default theme for patent cards
            const themeVariables = getThemeVariables(COMPANY_TYPES.DEFAULT, darkMode);
            return (
              <div key={patent.id} style={themeVariables}> {/* Apply default theme variables */}
                <div
                    className={`
                        rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl
                        bg-[var(--card-bg)] border border-[var(--card-border)]
                        transition-all duration-200
                        ${darkMode ? 'hover:ring-1 hover:ring-[var(--card-accent-ring)]' : 'hover:shadow-md'}
                    `}
                >
                    {/* Glossy overlay - reads variables from parent style */}
                    <div className="absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl bg-gradient-to-tr from-[var(--card-gradient-from)] via-[var(--card-gradient-via)] to-[var(--card-gradient-to)]"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center">
                                 {/* Optional Icon */}
                                 <div className={`flex-shrink-0 w-10 h-10 mr-3 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                     <Award size={20} className={`${darkMode ? 'text-blue-300' : 'text-blue-500'}`}/>
                                 </div>
                                 <h3 className="font-semibold text-lg text-[var(--text-primary)]">{patent.title}</h3>
                             </div>
                             {/* Link to Patent */}
                             <a href={patent.link} target="_blank" rel="noopener noreferrer"
                                className="flex-shrink-0 text-sm text-[var(--link-color)] hover:underline flex items-center ml-4 whitespace-nowrap"
                             >
                                 See Patent <ExternalLink size={14} className="ml-1"/>
                             </a>
                        </div>
                         <div className="pl-13"> {/* Align content below title */}
                            <p className="text-sm text-[var(--text-muted)] mb-3">{patent.patentNumber} &middot; {patent.issueDate}</p>
                            <p className="text-sm text-[var(--text-secondary)] text-wrap-pretty leading-relaxed">
                                {patent.description}
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareerTimeline;