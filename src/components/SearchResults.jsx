// src/components/SearchResults.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const SearchResults = ({ results }) => {
  return (
    <div>
      <ul>
        {results.map((result, index) => (
          <li key={index} className="border-b border-gray-200 dark:border-gray-700 py-2">
            <Link to={result.slug} className="text-blue-500 hover:underline">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{result.title}</h3>
              <p className="text-sm text-gray-900 dark:text-gray-100">Score: {result.score}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
