// src/components/Search.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import Card from './Card';

const mockResults = [
  { title: "First Post", slug: "/first-post", score: "1.0000" },
  { title: "Another Article", slug: "/another-article", score: "0.9876" },
  { title: "Yet Another Post", slug: "/yet-another-post", score: "0.9500" },
];

const Search = ({ toggleSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    // Simulate API call delay and then set mock results
    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 1000);
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
        <div onClick={(e) => e.stopPropagation()} className="relative z-10">
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
          </form>
          {loading && (
            <p className="text-gray-900 dark:text-gray-100">Searching...</p>
          )}
          {!loading && results.length > 0 && <SearchResults results={results} />}
          {!loading && query && results.length === 0 && (
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
