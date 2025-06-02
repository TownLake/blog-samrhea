// src/components/data/NewsPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Newspaper } from 'lucide-react';

const NewsPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="News & Media" icon={Newspaper}>
        <p>A collection of articles I've written or been featured in across various publications. Content for this section will be available soon.</p>
      </DataIntroCard>
    </div>
  );
};

export default NewsPage;