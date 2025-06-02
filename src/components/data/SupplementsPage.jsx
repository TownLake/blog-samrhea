// src/components/data/SupplementsPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Pill } from 'lucide-react';

const SupplementsPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="Supplements" icon={Pill}>
        <p>Hold.</p>
      </DataIntroCard>
    </div>
  );
};

export default SupplementsPage;