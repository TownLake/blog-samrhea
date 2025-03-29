// src/components/CareerTimeline.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Removed internal useDarkMode hook import
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook
import CompanyCard from './CompanyCard';
import TimelineRole from './TimelineRole';
import { getTextStyles, getCompanyType, COMPANY_TYPES } from '../utils/themeConfig';

/**
 * Career timeline component with improved state management using ThemeContext
 */
const CareerTimeline = () => {
  // Use the custom theme context hook
  const { darkMode } = useTheme(); // Renamed isDarkMode to darkMode for consistency

  // Define memoized rendering function to reduce re-renders
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
              className="custom-link" // Assuming .custom-link handles dark mode automatically now
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

  // Memoize text styles based on dark mode from context
  const textStyles = useMemo(() => getTextStyles(darkMode), [darkMode]);

  // Section list component for education sections - memoized
  const SectionList = useCallback(({ sections, companyName = '' }) => {
    const getTitleClass = () => {
      const companyType = getCompanyType(companyName);
      if (companyType === COMPANY_TYPES.UTAUSTIN) {
        // Use darkMode from context for conditional styling
        return darkMode ? 'text-orange-200' : 'text-[#bf5700]';
      }
      return '';
    };

    return (
      <div className="mt-6 pl-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <h4 className={`font-semibold mb-2 ${getTitleClass()}`}>
              {section.title}
            </h4>
            {/* Use textStyles derived from context's darkMode state */}
            <ul className={`space-y-1 text-sm ${textStyles.secondary}`}>
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start text-wrap-pretty" style={{ letterSpacing: '-0.01em' }}>
                  <span className="mr-2 mt-1 text-xs flex-shrink-0">•</span>
                  <span>
                    {typeof item === 'object' && item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="custom-link" // Assuming .custom-link handles dark mode automatically
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
    // Dependency array updated to use darkMode from context
  }, [darkMode, textStyles]);

  // Intro text from markdown file (kept as is for example)
  const introText = "I work on the Emerging Technology and Incubation team at Cloudflare. We ship the future that we think our customers will need months and years from now. I spent the previous six years launching, building, and leading the Zero Trust product line at Cloudflare as the VP of Product. I shipped the first prototype in that group into GA as a Product Manager in 2018. A few years later we became the only new vendor in the Gartner Magic Quadrant. Before that I launched our Registrar.";

  // Career data with roles from the provided resume (kept as is)
  const companyData = [
    {
      id: 1,
      name: "Cloudflare",
      logo: "https://cf-assets.www.cloudflare.com/slt3lc6tev37/6EYsdkdfBcHtgPmgp3YtkD/0b203affd2053988264b9253b13de6b3/logo-thumbnail.png",
      period: "2018 - Present",
      current: true,
      roles: [
        {
          id: "r1",
          title: "VP, Strategic Advisor & CoS - Emerging Technology and Incubation",
          period: "Jun 2024 - Present",
          achievements: [
            "Helping build the future in the Emerging Technology and Incubation team at Cloudflare.",
            ["Launched ", { text: "AI Audit", link: "https://blog.cloudflare.com/cloudflare-ai-audit-control-ai-content-crawlers/" }, " to give publishers control of their content from AI bots."]
          ]
        },
        {
          id: "r2",
          title: "VP of Product, Cloudflare Zero Trust",
          period: "Oct 2022 - Jun 2024",
          achievements: [
            "Led the Cloudflare Zero Trust product line.",
            ["The team made the biggest leap in the ", { text: "Gartner Magic Quadrant", link: "https://blog.cloudflare.com/cloudflare-sse-gartner-magic-quadrant-2024" }, " the year after our debut."],
            ["Acquired ", { text: "Vectrix", link: "https://blog.cloudflare.com/cloudflare-zero-trust-casb" }, " to integrate CASB capabilities for SaaS application security."],
            ["We kept customers safe while they ", { text: "adopted AI tools", link: "https://blog.cloudflare.com/zero-trust-ai-security/" }, "."],
            ["Cloudflare brought the Zero Trust products into our  ", { text: "Galileo and Athenian projects", link: "https://blog.cloudflare.com/cloudflare-zero-trust-for-galileo-and-athenian/" }, "."],
            ["And I ", { text: "killed Railgun", link: "https://blog.cloudflare.com/deprecating-railgun/" }, "."]
          ]
        },
        {
          id: "r3",
          title: "Senior Director of Product",
          period: "Apr 2022 - Oct 2022",
          achievements: [
            "Led the Cloudflare Zero Trust product line."
          ]
        },
        {
          id: "r4",
          title: "Director of Product",
          period: "Jul 2020 - Apr 2022",
          achievements: [
            "Led the Cloudflare Zero Trust product line.",
            ["Launched ", { text: "Cloudflare One", link: "https://blog.cloudflare.com/cloudflare-one/" }, ", our comprehensive Secure Access Service Edge (SASE) solution."],
            ["Launched our comprehensive ", { text: "DLP", link: "https://blog.cloudflare.com/data-loss-prevention/" }, " suite."],
            ["Shipped Cloudflare's ", { text: "Secure Web Gateway", link: "https://blog.cloudflare.com/tag/gateway" }, "."],
            ["Gave customers the ability to ", { text: "require hard keys", link: "https://blog.cloudflare.com/require-hard-key-auth-with-cloudflare-access/" }, " on a per-app basis."],
            ["Brought Zero Trust control to ", { text: "SaaS apps", link: "https://blog.cloudflare.com/cloudflare-access-for-saas/" }, ", too."],
            ["Helped customers deploy Zero Trust networks to replace their ", { text: "legacy corporate networks", link: "https://blog.cloudflare.com/build-your-own-private-network-on-cloudflare/" }, "."],
            ["Selected by ", { text: "CISA", link: "https://blog.cloudflare.com/helping-keep-governments-safe-and-secure" }, " to offer Internet security to US civilian agencies", "."]
          ]
        },
        {
          id: "r5",
          title: "Product Manager",
          period: "Jun 2018 - Jul 2020",
          achievements: [
            "Product Manager for Cloudflare Access, Cloudflare Registrar, and Cloudflare Tunnel.",
            ["Launched ", { text: "Cloudflare Access", link: "https://blog.cloudflare.com/cloudflare-access-now-teams-of-any-size-can-turn-off-their-vpn/" }, " to help teams turn off legacy VPNs."],
            ["Shipped ", { text: "Cloudflare Registrar", link: "https://blog.cloudflare.com/using-cloudflare-registrar/" }, ", our at-cost domain registration product."],
            ["Added ", { text: "SSH", link: "https://blog.cloudflare.com/releasing-the-cloudflare-access-feature-that-let-us-smash-a-vpn-on-stage" }, ", ", { text: "service tokens", link: "https://blog.cloudflare.com/give-your-automated-services-credentials-with-access-service-tokens/" }, ", ", { text: "command line flows", link: "https://blog.cloudflare.com/leave-your-vpn-and-curl-secure-apis-with-cloudflare-access/" }, ", ", { text: "RDP support", link: "https://blog.cloudflare.com/cloudflare-access-now-supports-rdp/" }, ", and ", { text: "comprehensive logging", link: "https://blog.cloudflare.com/log-every-request-to-corporate-apps-no-code-changes-required/" }, " to our Zero Trust platform."],
            ["Made auth seamless by shipping the ", { text: "App Launcher", link: "https://blog.cloudflare.com/announcing-the-cloudflare-access-app-launch/" }, ", adding ", { text: "Multi-SSO support", link: "https://blog.cloudflare.com/multi-sso-and-cloudflare-access-adding-linkedin-and-github-teams/" }, ", ", { text: "mutual TLS flows", link: "https://blog.cloudflare.com/using-your-devices-as-the-key-to-your-apps/" }, ", and ", { text: "per-app identity choice", link: "https://blog.cloudflare.com/releasing-cloudflare-access-most-requested-feature/" }, "."],
            ["Made ", { text: "Cloudflare Tunnel", link: "https://blog.cloudflare.com/a-free-argo-tunnel-for-your-next-project" }, " free for secure connections."],
            ["Made DNSSEC ", { text: "one-click", link: "https://blog.cloudflare.com/one-click-dnssec-with-cloudflare-registrar" }, " for all Registrar customers."]
          ]
        }
      ]
    },
    {
      id: 2,
      name: "DevFactory",
      logo: "https://devfactory.com/wp-content/uploads/2020/03/logo.png",
      period: "2013 - 2018",
      color: "#e11842", // Red color from DevFactory logo
      roles: [
        {
          id: "r6",
          title: "Product Manager",
          period: "Oct 2013 - May 2018",
          achievements: [
            "Part of the Product and Engineering assembly line component of ESW Capital."
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Ginor & Associates",
      logo: null, // Will use Lucide icon
      period: "2012 - 2013",
      roles: [
        {
          id: "r7",
          title: "Associate",
          period: "Nov 2012 - Oct 2013",
          achievements: []
        }
      ]
    },
    {
      id: 4,
      name: "Becker Venture Services Group",
      logo: null, // Will use Lucide icon
      period: "2011 - 2012",
      roles: [
        {
          id: "r8",
          title: "Research Associate",
          period: "Jun 2011 - Nov 2012",
          achievements: []
        }
      ]
    }
  ];

  // Education data with UT Austin burnt orange color scheme (kept as is)
  const educationData = [
    {
      id: 5,
      name: "The University of Texas at Austin",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/University_of_Texas_at_Austin_seal.svg/1920px-University_of_Texas_at_Austin_seal.svg.png",
      period: "2009 - 2013",
      color: "#bf5700", // UT Austin burnt orange
      roles: [
        {
          id: "e1",
          title: "BA with Highest Honors, Plan II",
          period: "Aug 2009 - May 2013",
          achievements: [
            "4.0 GPA - All coursework"
          ]
        }
      ],
      sections: [
        {
          title: "Honors",
          items: [
            { text: "Dean's Distinguished Graduate", link: "https://liberalarts.utexas.edu/scholarships-awards/dean-s-distinguished-graduates/" },
            { text: "Friar Society", link: "https://thefriarsociety.org/" },
            "Phi Beta Kappa"
          ]
        },
        {
          title: "Positions",
          items: [
            "Teaching Assistant to Bill Powers, President of UT Austin (Fall 2012)",
            "Research Assistant to Lance Bertelsen, PhD (Spring and Fall 2010)"
          ]
        },
        {
          title: "Awards",
          items: [
            { text: "Worthington Essay Contest Grand Prize (2011)", link: "https://liberalarts.utexas.edu/plan2/current-students/worthington-essay/" }
          ]
        },
        {
          title: "Scholarships",
          items: [
            { text: "Normandy Scholars Program", link: "https://liberalarts.utexas.edu/history/normandy-scholar-program-on-wwii/" },
            "Charles P. Shearn Endowed Scholarship (2012-2013)",
            "Plan II Alumni Endowed Presidential Scholarship (2011-2012)",
            "William Harold Whited Endowed Scholarship (2010-2011)"
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4" style={{ letterSpacing: '-0.025em' }}>At Work</h1>
        {/* Use textStyles derived from context's darkMode state */}
        <p className={`text-lg ${textStyles.secondary}`}
           style={{ letterSpacing: '-0.01em', lineHeight: '1.75', textWrap: 'pretty' }}>
          {introText}
        </p>
      </div>

      {/* Work experience */}
      <div className="space-y-6">
        {companyData.map((company, companyIndex) => (
          <CompanyCard
            key={company.id}
            company={company}
            // isDarkMode prop removed
            isLastCompany={companyIndex === companyData.length - 1}
          >
            {/* Roles within company */}
            <div className="mt-4 space-y-4 pl-2">
              {company.roles.map((role, roleIndex) => (
                <TimelineRole
                  key={role.id}
                  role={role}
                  companyType={getCompanyType(company.name)}
                  // isDarkMode prop removed
                  isLastRole={roleIndex === company.roles.length - 1}
                  renderAchievement={renderAchievement}
                />
              ))}
            </div>
          </CompanyCard>
        ))}

        {/* Education section */}
        {educationData.map((education) => (
          <CompanyCard
            key={education.id}
            company={education}
            // isDarkMode prop removed
            isLastCompany={true}
          >
            {/* Education roles */}
            <div className="mt-4 space-y-4 pl-2">
              {education.roles.map((role, roleIndex) => (
                <TimelineRole
                  key={role.id}
                  role={role}
                  companyType={getCompanyType(education.name)}
                  // isDarkMode prop removed
                  isLastRole={roleIndex === education.roles.length - 1}
                  renderAchievement={renderAchievement}
                />
              ))}
            </div>

            {/* Additional sections for education */}
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