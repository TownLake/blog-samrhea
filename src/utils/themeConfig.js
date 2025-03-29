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
  
  // Brand colors - consolidated from multiple places
  export const BRAND_COLORS = {
    [COMPANY_TYPES.CLOUDFLARE]: {
      primary: '#f48120', // Cloudflare orange
      dark: '#e37000',
      light: '#ffa94d'
    },
    [COMPANY_TYPES.DEVFACTORY]: {
      primary: '#e11842', // DevFactory red 
      dark: '#c91438',
      light: '#f2445e'
    },
    [COMPANY_TYPES.UTAUSTIN]: {
      primary: '#bf5700', // UT Austin burnt orange
      dark: '#9e4700',
      light: '#e0732e'
    },
    [COMPANY_TYPES.DEFAULT]: {
      primary: '#3b82f6', // Default blue
      dark: '#2563eb',
      light: '#60a5fa'
    }
  };
  
  // Timeline element colors - dark/light mode with improved dark mode contrast
  export const getTimelineColors = (companyType, isDarkMode) => {
    const colors = {
      [COMPANY_TYPES.CLOUDFLARE]: {
        dot: isDarkMode ? 'bg-orange-300' : 'bg-orange-500',
        line: isDarkMode ? 'bg-gray-700' : 'bg-orange-200',
        title: isDarkMode ? 'text-orange-200' : 'text-orange-500'
      },
      [COMPANY_TYPES.DEVFACTORY]: {
        dot: isDarkMode ? 'bg-red-300' : 'bg-red-500',
        line: isDarkMode ? 'bg-gray-700' : 'bg-red-200',
        title: isDarkMode ? 'text-red-200' : 'text-red-600'
      },
      [COMPANY_TYPES.UTAUSTIN]: {
        dot: isDarkMode ? 'bg-orange-300' : 'bg-[#bf5700]',
        line: isDarkMode ? 'bg-gray-700' : 'bg-orange-200',
        title: isDarkMode ? 'text-orange-200' : 'text-[#bf5700]'
      },
      [COMPANY_TYPES.DEFAULT]: {
        dot: isDarkMode ? 'bg-blue-300' : 'bg-gray-500',
        line: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
        title: isDarkMode ? 'text-blue-200' : 'text-gray-700'
      }
    };
    
    return colors[companyType] || colors[COMPANY_TYPES.DEFAULT];
  };
  
  // Badge styles for dates and other small indicators
  export const getBadgeStyles = (isDarkMode) => {
    return isDarkMode 
      ? 'bg-gray-800 text-gray-300 border border-gray-700' 
      : 'bg-gray-100 text-gray-600';
  };
  
  // Card background and border styles with improved dark mode aesthetics
  export const getCardStyles = (companyType, isDarkMode) => {
    // Common dark mode styles - more neutral for better visual appeal
    const darkModeBase = {
      background: 'bg-gray-800/90',
      border: 'border-gray-700',
      gradient: 'bg-gradient-to-tr from-gray-900/80 via-gray-800/60 to-gray-700/70'
    };
    
    // Subtle accents for different company types in dark mode
    const darkModeAccents = {
      [COMPANY_TYPES.CLOUDFLARE]: {
        accent: 'ring-1 ring-orange-900/50',
        hover: 'hover:ring-orange-800/60'
      },
      [COMPANY_TYPES.DEVFACTORY]: {
        accent: 'ring-1 ring-red-900/50',
        hover: 'hover:ring-red-800/60'
      },
      [COMPANY_TYPES.UTAUSTIN]: {
        accent: 'ring-1 ring-orange-900/50',
        hover: 'hover:ring-orange-800/60'
      },
      [COMPANY_TYPES.DEFAULT]: {
        accent: 'ring-1 ring-gray-700',
        hover: 'hover:ring-gray-600'
      }
    };
    
    // Light mode styles remain unchanged
    const styles = {
      [COMPANY_TYPES.CLOUDFLARE]: {
        background: isDarkMode ? darkModeBase.background : 'bg-white/90',
        border: isDarkMode ? darkModeBase.border : 'border-orange-200',
        gradient: isDarkMode 
          ? darkModeBase.gradient 
          : 'bg-gradient-to-tr from-orange-100/40 via-orange-50/20 to-white/30',
        accent: isDarkMode ? darkModeAccents[COMPANY_TYPES.CLOUDFLARE].accent : '',
        hover: isDarkMode ? darkModeAccents[COMPANY_TYPES.CLOUDFLARE].hover : ''
      },
      [COMPANY_TYPES.DEVFACTORY]: {
        background: isDarkMode ? darkModeBase.background : 'bg-white/90',
        border: isDarkMode ? darkModeBase.border : 'border-red-200',
        gradient: isDarkMode 
          ? darkModeBase.gradient
          : 'bg-gradient-to-tr from-red-100/40 via-red-50/20 to-white/30',
        accent: isDarkMode ? darkModeAccents[COMPANY_TYPES.DEVFACTORY].accent : '',
        hover: isDarkMode ? darkModeAccents[COMPANY_TYPES.DEVFACTORY].hover : ''
      },
      [COMPANY_TYPES.UTAUSTIN]: {
        background: isDarkMode ? darkModeBase.background : 'bg-white/90',
        border: isDarkMode ? darkModeBase.border : 'border-orange-200',
        gradient: isDarkMode 
          ? darkModeBase.gradient
          : 'bg-gradient-to-tr from-orange-100/40 via-orange-50/20 to-white/30',
        accent: isDarkMode ? darkModeAccents[COMPANY_TYPES.UTAUSTIN].accent : '',
        hover: isDarkMode ? darkModeAccents[COMPANY_TYPES.UTAUSTIN].hover : ''
      },
      [COMPANY_TYPES.DEFAULT]: {
        background: isDarkMode ? darkModeBase.background : 'bg-white/80',
        border: isDarkMode ? darkModeBase.border : 'border-gray-100',
        gradient: isDarkMode 
          ? darkModeBase.gradient
          : 'bg-gradient-to-tr from-white/40 via-gray-50/20 to-gray-100/30',
        accent: isDarkMode ? darkModeAccents[COMPANY_TYPES.DEFAULT].accent : '',
        hover: isDarkMode ? darkModeAccents[COMPANY_TYPES.DEFAULT].hover : ''
      }
    };
    
    return styles[companyType] || styles[COMPANY_TYPES.DEFAULT];
  };
  
  // Text styles for different modes with improved dark mode contrast
  export const getTextStyles = (isDarkMode) => {
    return {
      primary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      link: isDarkMode ? 'text-blue-300' : 'text-blue-600'
    };
  };
  
  // Common element styles
  export const ELEMENT_STYLES = {
    cardContainer: 'rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl transition-all duration-200',
    glossyOverlay: 'absolute -inset-0.5 backdrop-blur-md z-0 rounded-2xl',
    contentContainer: 'relative z-10',
    imageContainer: 'w-12 h-12 mr-3 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center',
    title: 'font-bold text-xl',
    badgeContainer: 'text-sm font-medium rounded-full px-3 py-1',
    iconContainer: 'w-8 h-8',
    bullet: 'mr-2 mt-1 text-xs flex-shrink-0'
  };