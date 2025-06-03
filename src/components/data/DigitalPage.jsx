// src/components/data/DigitalPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Laptop } from 'lucide-react';

const DigitalPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="Digital" icon={Laptop}>
        <p>Hold.</p>
      </DataIntroCard>
    </div>
  );
};

export default DigitalPage;