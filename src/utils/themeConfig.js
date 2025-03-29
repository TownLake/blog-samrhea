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
  // Default badge styles (can be overridden below if needed per-company in dark mode)
  vars['--badge-bg'] = isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(243, 244, 246, 1)'; // gray-700/90 dark / gray-100 light
  vars['--badge-text'] = isDarkMode ? 'rgba(209, 213, 219, 1)' : 'rgba(75, 85, 99, 1)'; // gray-300 dark / gray-600 light
  vars['--badge-border'] = isDarkMode ? 'rgba(75, 85, 99, 1)' : 'transparent'; // gray-600 dark border / none light // Slightly lighter border for visibility

  // --- Card Styles ---
  const cardBaseDarkBg = 'rgba(31, 41, 55, 0.9)'; // gray-800/90
  const cardBaseDarkBorder = 'rgba(55, 65, 81, 1)'; // gray-700
  const cardGradientDarkFrom = 'rgba(17, 24, 39, 0.8)'; // gray-900/80
  const cardGradientDarkVia = 'rgba(31, 41, 55, 0.6)';  // gray-800/60
  const cardGradientDarkTo = 'rgba(55, 65, 81, 0.7)';    // gray-700/70

  // Default Light mode card styles (NO CHANGES HERE)
  vars['--card-bg'] = 'rgba(255, 255, 255, 0.8)'; // white/80
  vars['--card-border'] = 'rgba(243, 244, 246, 1)'; // gray-100
  vars['--card-gradient-from'] = 'rgba(255, 255, 255, 0.4)'; // white/40
  vars['--card-gradient-via'] = 'rgba(249, 250, 251, 0.2)';  // gray-50/20
  vars['--card-gradient-to'] = 'rgba(243, 244, 246, 0.3)';    // gray-100/30
  vars['--card-accent-ring'] = 'transparent';

  // Override per company type (Light Mode) (NO CHANGES HERE)
  switch(companyType) {
      case COMPANY_TYPES.CLOUDFLARE:
          vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)';
          vars['--card-border'] = 'rgba(254, 215, 170, 1)';
          vars['--card-gradient-from'] = 'rgba(255, 237, 213, 0.4)';
          vars['--card-gradient-via'] = 'rgba(255, 250, 235, 0.2)';
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';
          break;
      case COMPANY_TYPES.DEVFACTORY:
          vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)';
          vars['--card-border'] = 'rgba(254, 202, 202, 1)';
          vars['--card-gradient-from'] = 'rgba(254, 226, 226, 0.4)';
          vars['--card-gradient-via'] = 'rgba(255, 237, 237, 0.2)';
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';
          break;
      case COMPANY_TYPES.UTAUSTIN:
           vars['--card-bg'] = 'rgba(255, 255, 255, 0.9)';
          vars['--card-border'] = 'rgba(254, 215, 170, 1)'; // Using same orange-200 as CF in light
          vars['--card-gradient-from'] = 'rgba(255, 237, 213, 0.4)';
          vars['--card-gradient-via'] = 'rgba(255, 250, 235, 0.2)';
          vars['--card-gradient-to'] = 'rgba(255, 255, 255, 0.3)';
          break;
  }

  // --- Timeline Styles (Defaults) ---
  // Set light mode defaults first
  vars['--timeline-dot-color'] = 'rgba(107, 114, 128, 1)'; // gray-500 light
  vars['--timeline-line-color'] = 'rgba(229, 231, 235, 1)'; // gray-200 light
  vars['--timeline-title-color'] = 'rgba(55, 65, 81, 1)'; // gray-700 light

  // Override per company type (Light Mode Timeline - NO CHANGES HERE)
   switch(companyType) {
      case COMPANY_TYPES.CLOUDFLARE:
          vars['--timeline-dot-color'] = 'rgba(249, 115, 22, 1)'; // orange-500
          vars['--timeline-line-color'] = 'rgba(254, 215, 170, 1)'; // orange-200
          vars['--timeline-title-color'] = 'rgba(249, 115, 22, 1)'; // orange-500
          break;
      case COMPANY_TYPES.DEVFACTORY:
           vars['--timeline-dot-color'] = 'rgba(239, 68, 68, 1)'; // red-500
           vars['--timeline-line-color'] = 'rgba(254, 202, 202, 1)'; // red-200
           vars['--timeline-title-color'] = 'rgba(220, 38, 38, 1)'; // red-600
          break;
      case COMPANY_TYPES.UTAUSTIN:
           vars['--timeline-dot-color'] = '#bf5700'; // burnt orange
           vars['--timeline-line-color'] = 'rgba(254, 215, 170, 1)'; // orange-200
           vars['--timeline-title-color'] = '#bf5700'; // burnt orange
          break;
  }

  // =====================================================
  // --- DARK MODE OVERRIDES ---
  // =====================================================
  if (isDarkMode) {
      // --- Base Dark Mode Styles ---
      vars['--card-bg'] = cardBaseDarkBg;
      vars['--card-border'] = cardBaseDarkBorder; // Default dark card border
      vars['--card-gradient-from'] = cardGradientDarkFrom;
      vars['--card-gradient-via'] = cardGradientDarkVia;
      vars['--card-gradient-to'] = cardGradientDarkTo;
      vars['--card-accent-ring'] = 'rgba(55, 65, 81, 1)'; // Default: gray-700 ring

      vars['--badge-bg'] = 'rgba(55, 65, 81, 0.9)'; // gray-700/90 dark bg
      vars['--badge-text'] = 'rgba(209, 213, 219, 1)'; // gray-300 dark text
      vars['--badge-border'] = 'rgba(75, 85, 99, 1)'; // gray-600 dark border default

      vars['--timeline-dot-color'] = 'rgba(96, 165, 250, 1)'; // Default: blue-400 dark
      vars['--timeline-line-color'] = 'rgba(55, 65, 81, 1)'; // Default: gray-700 dark
      vars['--timeline-title-color'] = 'rgba(191, 219, 254, 1)'; // Default: blue-200 dark

      // --- Dark Mode Company-Specific Overrides ---
      switch(companyType) {
          case COMPANY_TYPES.CLOUDFLARE:
               // Use a Cloudflare-appropriate orange, distinct from UT's Burnt Orange
               vars['--card-accent-ring'] = 'rgba(194, 65, 12, 0.6)'; // orange-700/60 (Brighter than the old orange-900)
               vars['--card-border'] = 'rgba(124, 45, 18, 0.7)'; // orange-800/70 - Subtle border hint
               vars['--timeline-dot-color'] = 'rgba(253, 186, 116, 1)'; // orange-300 (Kept for contrast)
               vars['--timeline-title-color'] = 'rgba(253, 186, 116, 1)'; // orange-300 (Kept for contrast)
               vars['--timeline-line-color'] = 'rgba(75, 85, 99, 0.7)'; // gray-600/70 - Slightly lighter than base border
               // Optional: Badge accent
               vars['--badge-border'] = 'rgba(194, 65, 12, 0.8)'; // orange-700/80 border
               vars['--badge-text'] = 'rgba(253, 230, 138, 1)'; // orange-200 text for contrast
               break;

          case COMPANY_TYPES.UTAUSTIN:
               // Use UT's specific Burnt Orange (#bf5700)
               const utBurntOrange = '#bf5700';
               const utBurntOrangeRGBA = 'rgba(191, 87, 0'; // Base RGBA for transparency adjustments
               vars['--card-accent-ring'] = `${utBurntOrangeRGBA}, 0.6)`; // Burnt orange ring
               vars['--card-border'] = `${utBurntOrangeRGBA}, 0.7)`; // Burnt orange subtle border
               vars['--timeline-dot-color'] = utBurntOrange; // Burnt orange dot
               vars['--timeline-title-color'] = utBurntOrange; // Burnt orange title
               vars['--timeline-line-color'] = 'rgba(75, 85, 99, 0.7)'; // gray-600/70 - Keep line neutral but slightly distinct
               // Optional: Badge accent
               vars['--badge-border'] = `${utBurntOrangeRGBA}, 0.8)`; // Burnt orange border
               vars['--badge-text'] = 'rgba(255, 237, 213, 1)'; // orange-100 text (light enough for contrast)
               break;

          case COMPANY_TYPES.DEVFACTORY:
               // No changes requested, but ensure it keeps its distinct accents if needed
               vars['--card-accent-ring'] = 'rgba(190, 18, 60, 0.5)'; // red-900/50
               vars['--card-border'] = 'rgba(159, 18, 57, 0.7)'; // red-800/70
               vars['--timeline-dot-color'] = 'rgba(252, 165, 165, 1)'; // red-300
               vars['--timeline-title-color'] = 'rgba(252, 165, 165, 1)'; // red-300
               // Optional: Badge accent
               vars['--badge-border'] = 'rgba(190, 18, 60, 0.8)'; // red-800/80 border
               vars['--badge-text'] = 'rgba(254, 205, 211, 1)'; // red-200 text
               break;

          // DEFAULT case already handled by base dark mode styles above
      }
  }

  return vars;
};