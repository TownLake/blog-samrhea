// src/components/Search.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react'; // For the close button icon
import { SearchResults } from './SearchResults'; // Component to display results
import Card from './Card'; // Assuming Card is a custom component for styling the modal

// --- Configuration ---
const DEBOUNCE_DELAY = 300; // Wait 300ms after user stops typing
const MIN_QUERY_LENGTH = 2; // Only search if query is at least 2 characters long

const Search = ({ toggleSearch }) => {
  // --- State Variables ---
  const [query, setQuery] = useState(''); // Stores the current text in the search input
  const [results, setResults] = useState([]); // Stores the search results from the API
  const [loading, setLoading] = useState(false); // Tracks if a search is in progress
  const [error, setError] = useState(null); // Stores any error message from the search

  // --- Refs ---
  const inputRef = useRef(null); // Ref to access the input DOM element for autofocus
  const debounceTimeoutRef = useRef(null); // Ref to store the ID of the debounce timer

  // --- Effect for Autofocus ---
  // Runs once when the component mounts to focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // Empty dependency array means it runs only on mount

  // --- API Call Function ---
  // Memoized function to perform the actual search query to the backend
  const performSearch = useCallback(async (searchTerm) => {
    // Basic validation - already checked in debounce effect, but good practice
    if (!searchTerm || searchTerm.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
    }

    setLoading(true); // Indicate loading state
    setError(null); // Clear previous errors

    try {
      // Make POST request to the backend function
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchTerm }), // Send the search term
      });

      // Handle non-successful HTTP responses
      if (!response.ok) {
        const errorData = await response.json(); // Try to parse error from backend
        throw new Error(errorData.error || `Search failed: ${response.statusText} (${response.status})`);
      }

      // Parse the successful JSON response (array of results)
      const data = await response.json();
      setResults(data); // Update the results state

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || 'An unexpected error occurred during search.'); // Set error state for display
      setResults([]); // Clear results on error
    } finally {
      setLoading(false); // Ensure loading indicator is turned off
    }
  }, []); // useCallback dependency array is empty as it doesn't rely on external state/props here

  // --- Effect for Debounced Search ---
  // Runs whenever the 'query' state changes
  useEffect(() => {
    // Clear any previously scheduled search (if user is still typing)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = query.trim(); // Use trimmed query for logic

    if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
      // If query is long enough, show loading immediately (optional)
      // setLoading(true); // You might prefer loading only when fetch starts in performSearch

      // Schedule the search function to run after the debounce delay
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(trimmedQuery);
      }, DEBOUNCE_DELAY);

    } else {
      // If query is too short or empty, clear results, error, and loading state
      setResults([]);
      setError(null);
      setLoading(false); // Ensure loading is off if query becomes too short
    }

    // Cleanup function: This runs when the component unmounts
    // or when the 'query' state changes *before* the effect runs again.
    // It clears the scheduled timeout to prevent unnecessary searches.
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, performSearch]); // Effect depends on 'query' and the 'performSearch' function

  // --- Event Handlers ---
  // Closes the modal if the user clicks on the backdrop (outside the card)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSearch(); // Call the function passed from the parent to close the modal
    }
  };

  // --- Render Logic ---
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-start pt-10 sm:pt-20 px-4" // Added padding
      aria-modal="true" // Accessibility attributes
      role="dialog"
      aria-labelledby="search-modal-title"
    >
      {/* Use the Card component for consistent styling */}
      <Card className="w-full max-w-2xl" glossy={true}>
        {/* Stop clicks inside the card from closing the modal */}
        <div onClick={(e) => e.stopPropagation()} className="relative z-10">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h2 id="search-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">Search Content</h2>
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
              ref={inputRef} // Assign ref for autofocus
              type="search" // Use type="search" for semantics and potential browser features (like clear button)
              value={query}
              onChange={(e) => setQuery(e.target.value)} // Update query state on every change
              placeholder="Start typing to search..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" // Enhanced styling
              aria-label="Search query" // Accessibility
            />
          </div>

          {/* Results/Status Display Area */}
          <div className="mt-4 min-h-[100px]"> {/* Added min-height to prevent layout shifts */}
            {loading && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">Searching...</p>
            )}
            {error && (
              <p className="text-red-600 dark:text-red-400 text-center py-4">Error: {error}</p>
            )}

            {/* Display results only if not loading and no error */}
            {!loading && !error && results.length > 0 && (
              <SearchResults results={results} />
            )}

            {/* Display 'No Results' message */}
            {!loading && !error && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No results found for "{query.trim()}"
              </p>
            )}

            {/* Display 'Keep Typing' message */}
            {!loading && !error && query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Please enter at least {MIN_QUERY_LENGTH} characters.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Search;