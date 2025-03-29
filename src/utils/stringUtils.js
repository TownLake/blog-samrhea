// src/utils/stringUtils.js
// Specialized utilities for string manipulation

/**
 * Remove frontmatter from markdown content
 * @param {string} content - The markdown content to process
 * @returns {string} - Content without frontmatter
 */
export const removeFrontmatter = (content) => {
    if (!content) return '';
    return content.replace(/^---[\s\S]*?---\n/, '');
  };
  
  /**
   * Compute reading time for content
   * @param {string} content - Content to compute reading time for
   * @param {number} wordsPerMinute - Reading speed in words per minute
   * @returns {number} - Estimated reading time in minutes
   */
  export const getReadingTime = (content, wordsPerMinute = 200) => {
    if (!content) return 0;
    
    // Count words by splitting on whitespace
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, minutes); // Minimum 1 minute
  };
  
  /**
   * Extracts text content from HTML
   * @param {string} html - HTML string to extract text from
   * @returns {string} - Plain text content
   */
  export const extractTextFromHtml = (html) => {
    if (!html) return '';
    
    // Simple implementation - for more complex needs, use a dedicated HTML parser
    return html
      .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();                  // Trim leading/trailing whitespace
  };
  
  /**
   * Create an excerpt from content
   * @param {string} content - Content to create excerpt from
   * @param {number} maxLength - Maximum length of excerpt
   * @returns {string} - Excerpt text
   */
  export const createExcerpt = (content, maxLength = 160) => {
    if (!content) return '';
    
    // Remove HTML and Markdown syntax for cleaner excerpts
    const plainText = content
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown
      .replace(/\[.*?\]\(.*?\)/g, '$1') // Replace links with just their text
      .replace(/[#*_~`]/g, '')  // Remove markdown formatting
      .replace(/\n+/g, ' ')     // Replace newlines with spaces
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();                  // Trim leading/trailing whitespace
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find a good breaking point near the maxLength
    let breakPoint = plainText.lastIndexOf(' ', maxLength);
    if (breakPoint === -1) breakPoint = maxLength;
    
    return plainText.substring(0, breakPoint) + '...';
  };
  
  /**
   * Highlight search term in text
   * @param {string} text - Text to highlight in
   * @param {string} search - Search term to highlight
   * @param {string} highlightClass - CSS class for highlighting
   * @returns {string} - HTML with highlighted search term
   */
  export const highlightSearchTerm = (text, search, highlightClass = 'highlight') => {
    if (!text || !search) return text || '';
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  };
  
  /**
   * Format a file size in bytes to a human-readable string
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };