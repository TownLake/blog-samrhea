// src/features/about/components/CareerTimeline.jsx
import React, { useCallback, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CompanyCard from './CompanyCard';
import TimelineRole from './TimelineRole';
import { getCompanyType, COMPANY_TYPES, getThemeVariables } from '../../../utils/themeConfig';
import { Award, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

import companyData from '../../../data/careerExperience.json';
import educationData from '../../../data/education.json';
import patentsData from '../../../data/patents.json';

const PatentCard = ({ patent, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const themeVariables = getThemeVariables(COMPANY_TYPES.DEFAULT, darkMode);

  return (
    <div style={themeVariables}>
      <div
        className={`
          rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl
          bg-[var(--card-bg)] border border-[var(--card-border)]
          transition-all duration-200
          ${darkMode ? 'hover:ring-1 hover:ring-[var(--card-accent-ring)]' : 'hover:shadow-md'}
        `}
      >
        <div className="absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl bg-gradient-to-tr from-[var(--card-gradient-from)] via-[var(--card-gradient-via)] to-[var(--card-gradient-to)]"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-10 h-10 mr-3 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Award size={20} className={`${darkMode ? 'text-blue-300' : 'text-blue-500'}`}/>
              </div>
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">{patent.title}</h3>
            </div>
            <a href={patent.link} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-sm text-[var(--link-color)] hover:underline flex items-center ml-4 whitespace-nowrap"
            >
              See Patent <ExternalLink size={14} className="ml-1"/>
            </a>
          </div>
          <div className="pl-13">
            <p className="text-sm text-[var(--text-muted)] mb-3">{patent.patentNumber} &middot; {patent.issueDate}</p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>{isExpanded ? 'Hide' : 'Show'} description</span>
            </button>
            {isExpanded && (
              <p className="text-sm text-[var(--text-secondary)] text-wrap-pretty leading-relaxed mt-3">
                {patent.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CareerTimeline = () => {
  const { darkMode } = useTheme();

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

  const SectionList = useCallback(({ sections, companyName = '' }) => {
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

  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      <div className="space-y-8">
         {companyData.map((company, companyIndex) => (
             <CompanyCard key={company.id} company={company} isLastCompany={companyIndex === companyData.length - 1}>
                 <div className="mt-6 space-y-6 pl-2">
                 {company.roles.map((role, roleIndex) => (
                     <TimelineRole key={role.id} role={role} companyType={getCompanyType(company.name)} isLastRole={roleIndex === company.roles.length - 1} renderAchievement={renderAchievement}/>
                 ))}
                 </div>
             </CompanyCard>
         ))}
      </div>

      <div className="space-y-8 mt-16">
         <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)]" style={{ letterSpacing: '-0.025em' }}>Education</h2>
         {educationData.map((education) => (
             <CompanyCard key={education.id} company={education} isLastCompany={true}>
                 <div className="mt-6 space-y-6 pl-2">
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

      {patentsData && patentsData.length > 0 && (
        <div className="space-y-8 mt-16">
          <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)]" style={{ letterSpacing: '-0.025em' }}>Patents</h2>
          {patentsData.map((patent) => {
            return <PatentCard key={patent.id} patent={patent} darkMode={darkMode} />;
          })}
        </div>
      )}
    </div>
  );
};

export default CareerTimeline;
