// src/features/search/Search.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchPosts } from '/src/services/postService.js';
import { SEARCH_CONFIG, DEFAULT_MESSAGES } from '/src/constants';
import { formatDate } from '/src/utils/formatters.js';

const Search = ({ toggleSearch }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef(null);

  const { data: posts = [], isLoading: postsLoading } = useQuery('posts', fetchPosts, {
    staleTime: Infinity, // Posts data is static, no need to refetch
  });

  useEffect(() => {
    searchInputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        toggleSearch(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(timerId);
  }, [query]);

  const searchResults = useMemo(() => {
    if (postsLoading || !debouncedQuery || debouncedQuery.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return [];
    }
    const lowercasedQuery = debouncedQuery.toLowerCase();
    return posts.filter(post =>
      post.title?.toLowerCase().includes(lowercasedQuery) ||
      post.description?.toLowerCase().includes(lowercasedQuery) ||
      post.category?.toLowerCase().includes(lowercasedQuery)
    );
  }, [debouncedQuery, posts, postsLoading]);

  const renderMessage = () => {
    if (postsLoading) return <p className="p-4 text-gray-500">{DEFAULT_MESSAGES.LOADING_SEARCH}</p>;
    if (query && query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return <p className="p-4 text-gray-500">{DEFAULT_MESSAGES.SEARCH_SHORT_QUERY(SEARCH_CONFIG.MIN_QUERY_LENGTH)}</p>;
    }
    if (debouncedQuery && searchResults.length === 0) {
      return <p className="p-4 text-gray-500">{DEFAULT_MESSAGES.NO_SEARCH_RESULTS(debouncedQuery)}</p>;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4" onClick={() => toggleSearch(false)}>
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-lg mx-auto rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full p-4 text-lg bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-0"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/post/${post.id}`}
                    onClick={() => toggleSearch(false)}
                    className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">{post.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(post.date)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            renderMessage()
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;