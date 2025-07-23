// src/components/ui/StatusMessage.jsx
import React from 'react';
import Card from '/src/components/ui/Card.jsx';

const StatusMessage = ({ type = 'info', message, details }) => {
  const baseClasses = "p-6 text-center";
  const titleClasses = "text-xl font-semibold mb-2 text-gray-900 dark:text-white";
  const textClasses = "text-gray-700 dark:text-gray-300";

  return (
    <div className="py-10 max-w-xl mx-auto">
      <Card className={baseClasses}>
        <h2 className={titleClasses}>{message}</h2>
        {details && <p className={textClasses}>{details}</p>}
      </Card>
    </div>
  );
};

export default StatusMessage;