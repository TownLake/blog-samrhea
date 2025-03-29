// src/components/LoadingIndicator.jsx
import React from 'react';
import { LoaderCircle } from 'lucide-react'; // Using lucide for an icon

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 py-10">
      <LoaderCircle size={32} className="animate-spin mb-3" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingIndicator;