// src/services/postService.js
// Centralized post data fetching and manipulation
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants';
import { removeFrontmatter } from '../utils/stringUtils';

/**
 * Fetch all posts and sort by date
 * @returns {Promise<Array>} Sorted posts array
 */
export const fetchPosts = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.POSTS);
    
    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.LOAD_POSTS_FAILED);
    }
    
    const postsData = await response.json();
    
    // Sort by date, handling missing dates gracefully
    return postsData.sort((a, b) => {
      if (!a.date) return 1;  // No date puts post at the end
      if (!b.date) return -1; // No date for b but date for a puts b at the end
      return new Date(b.date) - new Date(a.date); // Most recent first
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error; // Re-throw to allow component-level handling
  }
};

/**
 * Fetch single post with content
 * @param {string} slug - Post identifier
 * @returns {Promise<Object>} Post with content
 */
export const fetchPost = async (slug) => {
  try {
    // First, get the post metadata from the posts list
    const postsResponse = await fetch(API_ENDPOINTS.POSTS);
    
    if (!postsResponse.ok) {
      throw new Error(ERROR_MESSAGES.LOAD_POSTS_FAILED);
    }
    
    const postsData = await postsResponse.json();
    const postInfo = postsData.find(p => p.id === slug);
    
    if (!postInfo) {
      throw new Error(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    
    // Then, fetch the actual content
    const contentResponse = await fetch(API_ENDPOINTS.POST_CONTENT(postInfo.filename));
    
    if (!contentResponse.ok) {
      throw new Error(ERROR_MESSAGES.POST_CONTENT_NOT_FOUND);
    }
    
    const content = await contentResponse.text();
    const postContent = removeFrontmatter(content);
    
    // Return combined data
    return { 
      ...postInfo, 
      content: postContent 
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    throw error;
  }
};

/**
 * Filter posts based on category filter
 * @param {Array} posts - Array of posts
 * @param {string} filter - Category filter
 * @returns {Array} Filtered posts
 */
export const filterPosts = (posts, filter) => {
  if (!posts || !Array.isArray(posts)) return [];
  
  switch (filter) {
    case 'All':
      // Exclude reading category from "All"
      return posts.filter(post => {
        return !(post.category && post.category.toLowerCase() === 'reading');
      });
    
    case 'Starred':
      return posts.filter(post => {
        return post.starred === true || 
          (post.tags && post.tags.some(tag => tag.toLowerCase() === 'hits'));
      });
    
    case 'Reading':
      return posts.filter(post => {
        const category = post.category ? post.category.toLowerCase() : '';
        return category === 'reading';
      });
    
    case 'Portugal':
      return posts.filter(post => {
        const category = post.category ? post.category.toLowerCase() : '';
        return category === 'portugal' || category === 'portuguese';
      });
    
    case 'Texas':
      return posts.filter(post => {
        const category = post.category ? post.category.toLowerCase() : '';
        return category === 'texas';
      });
    
    case 'Cloudflare':
      return posts.filter(post => {
        const category = post.category ? post.category.toLowerCase() : '';
        return category === 'cloudflare';
      });
    
    default:
      return posts;
  }
};