// src/components/health/MetricSection.jsx

import React from 'react';
import MetricCard from './MetricCard';
import Card from '../Card';
import useDarkMode from '../../hooks/useDarkMode';

const MetricSection = ({ title, icon: Icon, metrics }) => {
  const [isDarkMode] = useDarkMode();
  
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={`${title}-${index}`} 
            {...metric} 
          />
        ))}
      </div>
    </section>
  );
};

export default MetricSection;