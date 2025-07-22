// src/components/data/health/MetricSection.jsx
import React from 'react';
import MetricCard from './MetricCard';

const MetricSection = ({ title, icon: Icon, metrics }) => {
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section id={sectionId} className="scroll-mt-20"> 
      <div className="flex items-center gap-3 mb-4">
        <a 
          href={`#${sectionId}`} 
          className="flex items-center gap-3 group" 
          style={{textDecoration: 'none'}} 
          title={`Link to ${title} section`}
        >
          <Icon className="w-6 h-6 text-gray-900 dark:text-white transition-transform group-hover:scale-110" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h2>
        </a>
      </div>
      {/* --- MODIFIED: A responsive grid that is 2-column on mobile for paired cards, and respects the original 2-column layout for all cards on desktop. --- */}
      <div className="grid grid-cols-2 gap-4"> 
        {metrics.map((metricProps, index) => (
          <div
            key={`${metricProps.dataKey}-${index}`}
            // On mobile (default), full-width cards span 2 columns, half-width span 1.
            // On medium screens and up, all cards span 1 column to create a uniform 2-column grid.
            className={metricProps.layout === 'full' ? 'col-span-2 md:col-span-1' : 'col-span-1'}
          >
            <MetricCard 
              {...metricProps}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MetricSection;
