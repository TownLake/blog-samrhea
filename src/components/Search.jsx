// src/components/Search.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import Card from './Card';

// Remove or keep mockResults for initial state or fallback if needed,
// but it shouldn't be used in the actual search logic anymore.
// const mockResults = [ ... ];

const Search = ({ toggleSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add state for potential errors

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null); // Reset error state on new search
    setResults([]); // Clear previous results immediately

    try {
      const response = await fetch('/api/search', { // Call your backend function
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }), // Send the query in the body
      });

      if (!response.ok) {
        // Handle HTTP errors (like 400, 500 from your function)
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse the JSON response from your function
      setResults(data); // Update state with the real results

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || 'Failed to fetch search results.'); // Set error state
      setResults([]); // Ensure results are empty on error
    } finally {
      setLoading(false); // Stop loading indicator regardless of success or error
    }
  };

  // Dismiss modal when clicking on the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSearch();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10"
    >
      <Card className="w-full max-w-2xl" glossy={true}>
        {/* ... (rest of the component remains the same, but add error display) ... */}
        <div onClick={(e) => e.stopPropagation()} className="relative z-10">
           {/* ... Title, Close Button, Form ... */}
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Search</h2>
            <button onClick={toggleSearch} aria-label="Close search">
              <X size={24} className="text-gray-900 dark:text-gray-100" />
            </button>
          </div>
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search term..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {/* Optionally add a submit button if hitting Enter isn't preferred */}
             {/* <button type="submit" className="p-2 bg-blue-500 text-white rounded ml-2">Search</button> */}
          </form>

          {/* Display Loading, Error, Results, or No Results */}
          {loading && (
            <p className="text-gray-900 dark:text-gray-100">Searching...</p>
          )}
          {error && (
            <p className="text-red-500 dark:text-red-400">Error: {error}</p>
          )}
          {!loading && !error && results.length > 0 && <SearchResults results={results} />}
          {!loading && !error && query && results.length === 0 && (
            <p className="text-gray-900 dark:text-gray-100">
              No results found for "{query}"
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Search;