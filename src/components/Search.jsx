// src/components/Search.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import Card from './Card';
import { API_ENDPOINTS, SEARCH_CONFIG, ERROR_MESSAGES, DEFAULT_MESSAGES } from '../constants'; // Import constants
// Import the new status components (will be created next)
import LoadingIndicator from './LoadingIndicator';
import StatusMessage from './StatusMessage';

// --- Configuration --- Use constants
const { DEBOUNCE_DELAY, MIN_QUERY_LENGTH } = SEARCH_CONFIG;
// const DEBOUNCE_DELAY = 300; // Old value
// const MIN_QUERY_LENGTH = 2; // Old value

const Search = ({ toggleSearch }) => {
  // --- State Variables ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Refs ---
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // --- Effect for Autofocus ---
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // --- API Call Function ---
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use constant for API endpoint
      const response = await fetch(API_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!response.ok) {
        let errorMsg = ERROR_MESSAGES.SEARCH_FAILED_GENERIC;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || `Search failed: ${response.statusText} (${response.status})`;
        } catch (parseError) {
            // Ignore if response isn't valid JSON
             errorMsg = `Search failed: ${response.statusText} (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || ERROR_MESSAGES.SEARCH_FAILED_GENERIC);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency array is empty

  // --- Effect for Debounced Search ---
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(trimmedQuery);
      }, DEBOUNCE_DELAY);

    } else {
      setResults([]);
      setError(null);
      setLoading(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, performSearch]); // Effect depends on 'query' and 'performSearch'

  // --- Event Handlers ---
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSearch();
    }
  };

  // --- Render Logic ---
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-start pt-10 sm:pt-20 px-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="search-modal-title"
    >
      <Card className="w-full max-w-2xl" glossy={true}>
        <div onClick={(e) => e.stopPropagation()} className="relative z-10">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h2 id="search-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">Search Blog Posts</h2>
            <button
              onClick={toggleSearch}
              aria-label="Close search"
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Input Area */}
          <div className="mb-4">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing to search..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              aria-label="Search query"
            />
          </div>

          {/* Results/Status Display Area */}
          <div className="mt-4 min-h-[100px]">
             {/* Use new components for status display */}
            {loading && <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_SEARCH} />}

            {error && !loading && <StatusMessage type="error" message={error} />}

            {!loading && !error && results.length > 0 && (
              <SearchResults results={results} />
            )}

            {/* No Results Message */}
            {!loading && !error && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
               <StatusMessage type="empty" message={DEFAULT_MESSAGES.NO_SEARCH_RESULTS(query.trim())} />
            )}

            {/* Keep Typing Message */}
            {!loading && !error && query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH && (
               <StatusMessage type="info" message={DEFAULT_MESSAGES.SEARCH_SHORT_QUERY(MIN_QUERY_LENGTH)} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Search;
