// src/features/health/components/MetricSection.jsx
import React from 'react';

const MetricSection = ({ title, icon: Icon, children }) => {
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section id={sectionId} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <a
          href={`#${sectionId}`}
          className="flex items-center gap-3 group"
          style={{ textDecoration: 'none' }}
          title={`Link to ${title} section`}
        >
          <Icon className="w-6 h-6 text-gray-900 dark:text-white transition-transform group-hover:scale-110" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h2>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
};

export default MetricSection;