// src/components/data/health/MetricSection.jsx

import React from 'react';
import MetricCard from './MetricCard';
import Card from '../../Card';
import useDarkMode from '../../../hooks/useDarkMode';

const MetricSection = ({ title, icon: Icon, metrics }) => {
  const [isDarkMode] = useDarkMode();

  // Determine the hash ID based on the title
  const sectionId = title.toLowerCase();

  // Handler for icon click to update URL hash without scrolling
  const handleIconClick = (e) => {
    e.preventDefault();

    // Update the URL with the hash without triggering a scroll
    const newUrl = `${window.location.pathname}${window.location.search}#${sectionId}`;
    window.history.replaceState(null, '', newUrl);

    // Optional: Show a small visual feedback
    const iconElement = e.currentTarget;
    iconElement.classList.add('opacity-50');
    setTimeout(() => {
      iconElement.classList.remove('opacity-50');
    }, 200);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {/* Make the icon clickable to update URL hash */}
        <a 
          href={`#${sectionId}`} 
          onClick={handleIconClick}
          className="cursor-pointer transition-opacity duration-200 hover:opacity-70"
          title={`Copy link to ${title} section`}
          aria-label={`Generate URL hash for ${title} section`}
        >
          <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
        </a>
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