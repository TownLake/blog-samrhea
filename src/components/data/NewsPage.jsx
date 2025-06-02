// src/components/data/NewsPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Newspaper } from 'lucide-react';

const NewsPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="News & Media" icon={Newspaper}>
        <p>Hold.</p>
      </DataIntroCard>
    </div>
  );
};

export default NewsPage;