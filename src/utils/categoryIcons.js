// src/utils/categoryIcons.js
// Centralized category icons mapping for consistent usage across components

// Map of category to emoji
export const categoryIcons = {
    'reading': '📚',
    'texas': '🤠',
    'walkthrough': '🚶',
    'portugal': '🇵🇹',
    'portuguese': '🇵🇹', // Alias for 'portugal'
    'parenting': '👨‍👩‍👧‍👦',
    'habits': '📊',
    'cloudflare': '⛅'
  };
  
  /**
   * Get the icon for a given category
   * @param {string} category - The post category
   * @returns {string|null} - The emoji for the category or null if not found
   */
  export const getCategoryIcon = (category) => {
    if (!category) return null;
    const lowerCategory = String(category).toLowerCase();
    return categoryIcons[lowerCategory] || null;
  };
  
  /**
   * Check if a post is starred (has "starred" property or "hits" tag)
   * @param {Object} post - The post object
   * @returns {boolean} - Whether the post is starred
   */
  export const isStarred = (post) => {
    if (!post) return false;
    
    // Check if post has starred property directly
    if (post.starred === true) return true;
    
    // Check if post has "hits" tag in tags array
    if (post.tags && Array.isArray(post.tags)) {
      return post.tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === 'hits');
    }
    
    return false;
  };