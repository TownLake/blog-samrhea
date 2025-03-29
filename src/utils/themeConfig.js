// src/utils/themeConfig.js

// Company type constants for consistent referencing
export const COMPANY_TYPES = {
  CLOUDFLARE: 'cloudflare',
  DEVFACTORY: 'devfactory',
  UTAUSTIN: 'utaustin',
  DEFAULT: 'default'
};

// Map company names to company types for consistent styling
export const getCompanyType = (companyName) => {
if (!companyName) return COMPANY_TYPES.DEFAULT;

const name = typeof companyName === 'string' ? companyName.toLowerCase() : '';

if (name.includes('cloudflare')) return COMPANY_TYPES.CLOUDFLARE;
if (name.includes('devfactory')) return COMPANY_TYPES.DEVFACTORY;
if (name.includes('university of texas') || name.includes('utaustin')) return COMPANY_TYPES.UTAUSTIN;

return COMPANY_TYPES.DEFAULT;
};

// Function to generate CSS variables based on theme
export const getThemeVariables = (companyType = COMPANY_TYPES.DEFAULT, isDarkMode = false) => {
  const vars = {};

  // --- Base Text Colors (Reference variables set in index.css) ---
  vars['--text-muted'] = isDarkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)'; // gray-400 dark / gray-500 light
  vars['--link-color'] = isDarkMode ? 'rgba(147, 197, 253, 1)' : 'rgba(59, 130, 246, 1)'; // blue-300 dark / blue-600 light

  // --- Badge Styles ---
  vars['--badge-bg'] = isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(243, 244, 246, 1)'; // gray-800 dark / gray-100 light
  vars['--badge-text'] = isDarkMode ? 'rgba(209, 213, 219, 1)' : 'rgba(75, 85, 99, 1)'; // gray-300 dark / gray-600 light
  vars['--badge-border'] = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'transparent'; // gray-700 dark / none light

  // --- Card Styles ---
  const cardBaseDarkBg = 'rgba(31, 41, 55, 0.9)'; // gray-800/90
  const cardBaseDarkBorder = 'rgba(55, 65, 81, 1)'; // gray-700
  const cardGradientDarkFrom = 'rgba(17, 24, 39, 0.8)'; // gray-900/80
  const cardGradientDarkVia = 'rgba(31, 41, 55, 0.6)';  // gray-800/60
  const cardGradientDarkTo = 'rgba(55, 65, 81, 0.7)';    // gray-700/70

  // Default Light mode card styles
  vars['--card-bg'] = 'rgba(255, 255, 255, 0.8)'; // white/80
  vars['--card-border'] = 'rgba(243, 244, 246, 1)'; // gray-100
  vars['--card-gradient-from'] = 'rgba(255, 255, 255, 0.4)'; // white/40
  vars['--card-gradient-via'] = 'rgba(249, 250, 251, 0.2)';  // gray-50/20
  vars['--card-gradient-to'] = 'rgba(243, 244, 246, 0.3)';    // gray-100/30
  vars['--card-accent-ring'] = 'transparent'; // No ring in light mode default

  // Override per company type (Light Mode)
  switch(companyType) {
      case COMPANY_TYPES.CLOUDFLARE:
          vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)'; // white/90
          vars['--card-border'] = 'rgba(254, 215, 170, 1)'; // orange-200
          vars['--card-gradient-from'] = 'rgba(255, 237, 213, 0.4)'; // orange-100/40
          vars['--card-gradient-via'] = 'rgba(255, 250, 235, 0.2)';  // orange-50/20
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';    // white/30
          break;
      case COMPANY_TYPES.DEVFACTORY:
          vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)'; // white/90
          vars['--card-border'] = 'rgba(254, 202, 202, 1)'; // red-200
          vars['--card-gradient-from'] = 'rgba(254, 226, 226, 0.4)'; // red-100/40
          vars['--card-gradient-via'] = 'rgba(255, 237, 237, 0.2)';  // red-50/20
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';    // white/30
          break;
      case COMPANY_TYPES.UTAUSTIN:
           vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)'; // white/90
          vars['--card-border'] = 'rgba(254, 215, 170, 1)'; // orange-200 (using same as CF)
          vars['--card-gradient-from'] = 'rgba(255, 237, 213, 0.4)'; // orange-100/40
          vars['--card-gradient-via'] = 'rgba(255, 250, 235, 0.2)';  // orange-50/20
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';    // white/30
          break;
  }

  // Override ALL card styles if dark mode is enabled
  if (isDarkMode) {
      vars['--card-bg'] = cardBaseDarkBg;
      vars['--card-border'] = cardBaseDarkBorder;
      vars['--card-gradient-from'] = cardGradientDarkFrom;
      vars['--card-gradient-via'] = cardGradientDarkVia;
      vars['--card-gradient-to'] = cardGradientDarkTo;

      // Dark mode accents (using ring color)
      switch(companyType) {
          case COMPANY_TYPES.CLOUDFLARE:
          case COMPANY_TYPES.UTAUSTIN: // Grouping UT with Cloudflare orange accent
               vars['--card-accent-ring'] = 'rgba(154, 52, 18, 0.5)'; // orange-900/50
               break;
          case COMPANY_TYPES.DEVFACTORY:
               vars['--card-accent-ring'] = 'rgba(190, 18, 60, 0.5)'; // red-900/50
               break;
          case COMPANY_TYPES.DEFAULT:
          default:
               vars['--card-accent-ring'] = 'rgba(55, 65, 81, 1)'; // gray-700
               break;
      }
  }

  // --- Timeline Styles ---
  // Default assignments first
  vars['--timeline-dot-color'] = isDarkMode ? 'rgba(96, 165, 250, 1)' : 'rgba(107, 114, 128, 1)'; // Default: blue-400 dark / gray-500 light
  vars['--timeline-line-color'] = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)'; // Default: gray-700 dark / gray-200 light
  vars['--timeline-title-color'] = isDarkMode ? 'rgba(191, 219, 254, 1)' : 'rgba(55, 65, 81, 1)'; // Default: blue-200 dark / gray-700 light

  // Override per company type (Timeline)
   switch(companyType) {
      case COMPANY_TYPES.CLOUDFLARE:
          // **** CORRECTED THIS LINE ****
          vars['--timeline-dot-color'] = isDarkMode ? 'rgba(253, 186, 116, 1)' : 'rgba(249, 115, 22, 1)'; // Dark: orange-300 Light: orange-500
          vars['--timeline-line-color'] = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(254, 215, 170, 1)'; // Dark: gray-700  Light: orange-200
          vars['--timeline-title-color'] = isDarkMode ? 'rgba(253, 186, 116, 1)' : 'rgba(249, 115, 22, 1)'; // Dark: orange-300 Light: orange-500
          break;
      case COMPANY_TYPES.DEVFACTORY:
           vars['--timeline-dot-color'] = isDarkMode ? 'rgba(252, 165, 165, 1)' : 'rgba(239, 68, 68, 1)'; // Dark: red-300  Light: red-500
           vars['--timeline-line-color'] = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(254, 202, 202, 1)'; // Dark: gray-700 Light: red-200
           vars['--timeline-title-color'] = isDarkMode ? 'rgba(252, 165, 165, 1)' : 'rgba(220, 38, 38, 1)'; // Dark: red-300  Light: red-600
          break;
      case COMPANY_TYPES.UTAUSTIN:
           vars['--timeline-dot-color'] = isDarkMode ? 'rgba(253, 186, 116, 1)' : '#bf5700'; // Dark: orange-300 Light: burnt orange
           vars['--timeline-line-color'] = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(254, 215, 170, 1)'; // Dark: gray-700 Light: orange-200
           vars['--timeline-title-color'] = isDarkMode ? 'rgba(253, 186, 116, 1)' : '#bf5700'; // Dark: orange-300 Light: burnt orange
          break;
  }

  return vars;
};