// src/constants/index.js
// Centralized constants for the application

// Pagination
export const POSTS_PER_PAGE = 12;

// Filter options for main page
export const FILTER_OPTIONS = [
  { id: 'Starred', label: 'Hits', icon: '⭐' },
  { id: 'Reading', label: 'Reading', icon: '📚' },
  { id: 'Portugal', label: 'Portugal', icon: '🇵🇹' },
  { id: 'Texas', label: 'Texas', icon: '🤠' },
  { id: 'Cloudflare', label: 'Cloudflare', icon: '⛅' },
];

// About page section options
export const ABOUT_SECTIONS = [
  { id: 'home', label: 'Home', icon: '👋', path: '/about/home' },
  { id: 'work', label: 'Work', icon: '👷', path: '/about/work' },
  { id: 'school', label: 'School', icon: '🎓', path: '/about/school' },
  { id: 'portugal', label: 'Portugal', icon: '🇵🇹', path: '/about/portugal' },
  { id: 'projects', label: 'Projects', icon: '🚧', path: '/about/projects' },
];

// API Endpoints
export const API_ENDPOINTS = {
  POSTS: '/posts.json',
  POST_CONTENT: (filename) => `/content/posts/${filename}`,
  ABOUT_CONTENT: (section) => `/content/about/${section}.md`,
  SEARCH: '/api/search', // Added Search API endpoint
};

// Animation timings
export const ANIMATION_TIMING = {
  LOADING_TIMEOUT: 200, // ms
  TRANSITION: 300, // ms
};

// Error messages
export const ERROR_MESSAGES = {
  LOAD_POSTS_FAILED: 'Failed to load posts data',
  POST_NOT_FOUND: 'Post not found',
  POST_CONTENT_NOT_FOUND: 'Post content not found',
  CONTENT_LOAD_FAILED: 'Failed to load content',
  SEARCH_FAILED_GENERIC: 'An error occurred during search.', // Added generic search error
  DEFAULT_EMPTY_CONTENT: 'Content not available.',
};

// Default messages
export const DEFAULT_MESSAGES = {
  LOADING_POSTS: 'Loading posts...',
  LOADING_POST: 'Loading post...',
  LOADING_CONTENT: 'Loading content...', // Added generic loading
  LOADING_SEARCH: 'Searching content...', // Added search loading
  NO_POSTS_FOUND: 'No posts found with the selected filter.',
  NO_SEARCH_RESULTS: (query) => `No results found for "${query}"`, // Dynamic no results message
  SEARCH_SHORT_QUERY: (length) => `Please enter at least ${length} characters.`, // Dynamic short query message
  POST_NOT_FOUND_TITLE: 'Post Not Found',
  POST_NOT_FOUND_MESSAGE: 'Sorry, the post you\'re looking for doesn\'t exist or has been moved.',
  SECTION_NOT_FOUND: 'Section not found',
};

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  ABOUT_SECTION: (section) => `/about/${section}`,
  POST: (slug) => `/post/${slug}`,
  FILTER: (filter) => `/${filter.toLowerCase()}`,
  NOT_FOUND: '/404',
};

// Size constants
export const SIZES = {
  MOBILE_BREAKPOINT: 768, // pixels
  MAX_CONTENT_WIDTH: 2048, // pixels
  AVATAR_SIZE: 48, // pixels
};

// Local storage keys
export const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  CONTENT_CACHE: 'contentCache',
};

// Event names (Removed DARK_MODE_CHANGE)
// export const EVENTS = { ... }; // Can remove if empty

// Search Configuration
export const SEARCH_CONFIG = {
    DEBOUNCE_DELAY: 300, // ms
    MIN_QUERY_LENGTH: 2,
};