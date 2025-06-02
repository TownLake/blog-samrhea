// src/components/data/SupplementsPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Pill } from 'lucide-react';

const SupplementsPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="Supplements" icon={Pill}>
        <p>An overview of the supplements I take, the reasons why, and links to relevant research. This is not medical advice. Content for this section will be available soon.</p>
      </DataIntroCard>
    </div>
  );
};

export default SupplementsPage;