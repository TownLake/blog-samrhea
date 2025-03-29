// src/config/chartConfig.js

// Recharts specific configurations
export const chartMargins = {
    daily: { top: 10, right: 30, left: 10, bottom: 0 },
    monthly: { top: 10, right: 30, left: 10, bottom: 5 },
  };
  
  export const monthlyChartConfig = {
    maxBarSize: 50,
    // Define neutral bar color directly here if preferred over hardcoding in component
    // barColor: "#4B5563",
  };
  
  // Colors for chart elements sensitive to dark mode
  // Using Tailwind color names for reference, but defining hex for Recharts
  export const axisConfig = {
    light: {
      stroke: '#6B7280',      // gray-500: Axis lines, tick lines
      tickFill: '#6B7280',    // gray-500: Tick text fill
      axisLine: '#D1D5DB',    // gray-300: Main axis line (slightly darker than grid)
    },
    dark: {
      stroke: '#9CA3AF',      // gray-400: Axis lines, tick lines
      tickFill: '#9CA3AF',    // gray-400: Tick text fill
      axisLine: '#4B5563',    // gray-600: Main axis line
    }
  };
  
  export const gridConfig = {
    light: {
      stroke: '#E5E7EB',      // gray-200
      // Optional: Use Tailwind class for opacity on dark? Maybe not needed if dark stroke is defined
      // className: 'dark:opacity-20'
    },
    dark: {
      stroke: '#374151',      // gray-700 (Darker grid lines for contrast)
      // className: ''
    }
  };
  
  // Fallback color for trend lines/areas if needed
  export const defaultTrendColor = {
    hex: "#a1a1aa", // gray-400 (Adjust if needed)
  };
  
  // Other constants could be added here (e.g., animation settings)