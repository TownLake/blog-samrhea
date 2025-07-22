// src/components/data/health/MetricSection.jsx
import React from 'react';
import MetricCard from './MetricCard';

// --- MODIFIED: Accept createMetricProps function as a prop and add more robust error handling ---
const MetricSection = ({ title, icon: Icon, metrics, createMetricProps }) => {
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  // We can't render cards without this function, so we'll check for it.
  if (!createMetricProps) {
    return null; 
  }

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
      <div className="grid grid-cols-2 gap-4"> 
        {/* --- MODIFIED: Use optional chaining on `metrics` to prevent crash if it's undefined. --- */}
        {/* This ensures we always attempt to map over an array, defaulting to an empty one. */}
        {(metrics || []).map((metric, index) => {
          // Additional guard clause to ensure the metric object itself is valid before processing.
          if (!metric) {
            return null;
          }
          
          const metricProps = createMetricProps(metric);
          
          return (
            <div
              // Add a more robust key with a fallback
              key={`${metricProps.dataKey || title}-${index}`}
              className={metricProps.layout === 'full' ? 'col-span-2 md:col-span-1' : 'col-span-1'}
            >
              <MetricCard 
                {...metricProps}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MetricSection;
