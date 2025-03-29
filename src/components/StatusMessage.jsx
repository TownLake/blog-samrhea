// src/components/StatusMessage.jsx
import React from 'react';
import { AlertCircle, Info, SearchX, ServerCrash } from 'lucide-react'; // Icons for different types

const StatusMessage = ({ type = 'info', message, details = null }) => {
  let IconComponent;
  let textColorClass;
  let bgColorClass;
  let borderColorClass;

  switch (type) {
    case 'error':
      IconComponent = AlertCircle;
      textColorClass = 'text-red-700 dark:text-red-300';
      bgColorClass = 'bg-red-50 dark:bg-red-900/30';
      borderColorClass = 'border-red-300 dark:border-red-600/50';
      break;
    case 'empty':
      IconComponent = SearchX;
      textColorClass = 'text-gray-600 dark:text-gray-400';
      bgColorClass = 'bg-gray-50 dark:bg-gray-800/30';
      borderColorClass = 'border-gray-200 dark:border-gray-700/50';
      break;
    case 'loading': // Added just in case, though LoadingIndicator is separate
       IconComponent = Info; // Or LoaderCircle if needed here
       textColorClass = 'text-blue-700 dark:text-blue-300';
       bgColorClass = 'bg-blue-50 dark:bg-blue-900/30';
       borderColorClass = 'border-blue-200 dark:border-blue-600/50';
       break;
    case 'info':
    default:
      IconComponent = Info;
      textColorClass = 'text-blue-700 dark:text-blue-300';
      bgColorClass = 'bg-blue-50 dark:bg-blue-900/30';
      borderColorClass = 'border-blue-200 dark:border-blue-600/50';
      break;
  }

  return (
    <div className={`border ${borderColorClass} rounded-md p-4 my-4 ${bgColorClass} ${textColorClass} flex items-start`}>
      <IconComponent size={20} className="mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-grow">
        <p className="font-medium">{message}</p>
        {details && <p className="text-sm opacity-80 mt-1">{details}</p>}
      </div>
    </div>
  );
};

export default StatusMessage;