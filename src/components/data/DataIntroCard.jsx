// src/components/data/DataIntroCard.jsx
import React from 'react';
import Card from '../Card';

const DataIntroCard = ({ title, icon: Icon, children }) => (
  <Card className="mb-6 p-6">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5 text-blue-500" />}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    
    <div className="text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </Card>
);

export default DataIntroCard;