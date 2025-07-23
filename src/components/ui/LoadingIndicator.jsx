// src/components/ui/LoadingIndicator.jsx
import React from 'react';

const LoadingIndicator = ({ message = 'Loading...' }) => (
  <div className="py-20 text-center text-gray-500 dark:text-gray-400">
    <p>{message}</p>
  </div>
);

export default LoadingIndicator;