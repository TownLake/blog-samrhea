// src/utils/validation.js
// Utility functions for validation

/**
 * Checks if a value is empty (null, undefined, empty string, or empty array/object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty, false otherwise
 */
export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  };
  
  /**
   * Checks if a value is a valid email address
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email, false otherwise
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    // Simple regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Checks if a string is a valid URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL, false otherwise
   */
  export const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Checks if a date string is valid
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} - True if valid date, false otherwise
   */
  export const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };
  
  /**
   * Validates a post object has required fields
   * @param {Object} post - Post object to validate
   * @returns {Object} - Object with isValid and errors properties
   */
  export const validatePost = (post) => {
    const errors = {};
    
    if (!post) {
      return { isValid: false, errors: { general: 'Post data is required' } };
    }
    
    if (!post.title) {
      errors.title = 'Title is required';
    }
    
    if (!post.id) {
      errors.id = 'ID is required';
    }
    
    if (post.date && !isValidDate(post.date)) {
      errors.date = 'Invalid date format';
    }
    
    if (post.url && !isValidUrl(post.url)) {
      errors.url = 'Invalid URL format';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Ensures a value is within a min/max range
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} - Clamped value
   */
  export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };
  
  /**
   * Checks if a value is a valid number
   * @param {*} value - Value to check
   * @returns {boolean} - True if valid number, false otherwise
   */
  export const isNumber = (value) => {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(value);
    return false;
  };