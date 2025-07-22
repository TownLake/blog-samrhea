// src/components/data/health/MetricSection.jsx
import React from 'react';
import MetricCard from './MetricCard';

// --- MODIFIED: Accept createMetricProps function as a prop ---
const MetricSection = ({ title, icon: Icon, metrics, createMetricProps }) => {
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  // --- ADDED: A defensive check to prevent crashes if metrics is not an array ---
  if (!Array.isArray(metrics) || !createMetricProps) {
    return null; // Render nothing if the necessary props aren't provided
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
        {/* --- MODIFIED: Map over raw metrics and call createMetricProps inside --- */}
        {metrics.map((metric, index) => {
          const metricProps = createMetricProps(metric);
          return (
            <div
              key={`${metricProps.dataKey}-${index}`}
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
