// src/constants/index.js

// --- DEPENDENCIES DECLARED FIRST ---
export const FILTER_OPTIONS = [
  { id: 'Starred', label: 'Starred', icon: '⭐' },
  { id: 'Reading', label: 'Reading List', icon: '📚' },
  { id: 'Portugal', label: 'Portugal', icon: '🇵🇹' },
  { id: 'Texas', label: 'Texas', icon: '🤠' },
  { id: 'Cloudflare', label: 'At Cloudflare', icon: '⛅' },
];

// --- MAIN NAVIGATION MAP (DEPENDS ON THE ABOVE) ---
export const NAVIGATION_MAP = {
  blog: {
    id: 'blog',
    label: 'Blog',
    icon: '📝',
    path: '/',
    contextIcon: '📝',
    subnav: [
      { id: 'All', label: 'All Posts', icon: '🗂️', path: '/' },
      ...FILTER_OPTIONS.map(opt => ({...opt, path: `/${opt.id.toLowerCase()}`}))
    ]
  }
};

export const PRIMARY_NAV_SECTIONS = [
  NAVIGATION_MAP.blog
];


// --- OTHER CONSTANTS ---
export const POSTS_PER_PAGE = 12;

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  POST: (slug) => `/post/${slug}`,
  DATA: '/data',
  NOT_FOUND: '/404',
};

export const API_ENDPOINTS = {
  POSTS: '/posts.json',
  POST_CONTENT: (filename) => `/content/posts/${filename}`,
  ABOUT_CONTENT: (section) => `/content/about/${section}.md`,
  SEARCH: '/api/search',
};

export const ANIMATION_TIMING = {
  LOADING_TIMEOUT: 200,
  TRANSITION: 300,
};

export const ERROR_MESSAGES = {
  LOAD_POSTS_FAILED: 'Failed to load posts data',
  POST_NOT_FOUND: 'Post not found',
  POST_CONTENT_NOT_FOUND: 'Post content not found',
  CONTENT_LOAD_FAILED: 'Failed to load content',
  SEARCH_FAILED_GENERIC: 'An error occurred during search.',
  DEFAULT_EMPTY_CONTENT: 'Content not available.',
};

export const DEFAULT_MESSAGES = {
  LOADING_POSTS: 'Loading posts...',
  LOADING_POST: 'Loading post...',
  LOADING_CONTENT: 'Loading content...',
  LOADING_SEARCH: 'Searching content...',
  NO_POSTS_FOUND: 'No posts found with the selected filter.',
  NO_SEARCH_RESULTS: (query) => `No results found for "${query}"`,
  SEARCH_SHORT_QUERY: (length) => `Please enter at least ${length} characters.`,
  POST_NOT_FOUND_TITLE: 'Post Not Found',
  POST_NOT_FOUND_MESSAGE: 'Sorry, the post you\'re looking for doesn\'t exist or has been moved.',
  SECTION_NOT_FOUND: 'Section not found',
};

export const SIZES = {
  MOBILE_BREAKPOINT: 768,
  MAX_CONTENT_WIDTH: 2048,
  AVATAR_SIZE: 48,
};

export const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  CONTENT_CACHE: 'contentCache',
};

export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_QUERY_LENGTH: 2,
};