// src/utils/formatters.js
// Centralized utility functions for formatting and transformations

/**
 * Formats a date string to a human-readable format
 * @param {string} dateStr - Date string to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        ...options
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  /**
   * Returns a year-month string from a date
   * @param {string} dateStr - Date string to format
   * @returns {string} - Year-Month format (e.g. "2023-Jan")
   */
  export const getYearMonth = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      return `${year}-${month}`;
    } catch (error) {
      console.error('Error getting year-month:', error);
      return '';
    }
  };
  
  /**
   * Capitalize the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  export const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * Safely parses a string to JSON
   * @param {string} str - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} - Parsed object or default value
   */
  export const safeJsonParse = (str, defaultValue = {}) => {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  };
  
  /**
   * Truncates text to a specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncating
   * @returns {string} - Truncated text with ellipsis if needed
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength).trim() + '...';
  };
  
  /**
   * Creates a URL-friendly slug from a string
   * @param {string} str - String to slugify
   * @returns {string} - URL-friendly slug
   */
  export const slugify = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  /**
   * Groups an array of objects by a specific key
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} - Grouped object
   */
  export const groupBy = (array, key) => {
    if (!array || !Array.isArray(array)) return {};
    
    return array.reduce((result, item) => {
      const groupKey = item[key] || 'undefined';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  };
  
  /**
   * Gets unique values from an array of objects by key
   * @param {Array} array - Array of objects
   * @param {string} key - Key to get unique values for
   * @returns {Array} - Array of unique values
   */
  export const getUniqueByKey = (array, key) => {
    if (!array || !Array.isArray(array)) return [];
    
    const uniqueValues = new Set();
    array.forEach(item => {
      if (item && item[key]) {
        uniqueValues.add(item[key]);
      }
    });
    
    return Array.from(uniqueValues);
  };