// src/components/data/DigitalPage.jsx
import React from 'react';
import DataIntroCard from './DataIntroCard';
import { Laptop } from 'lucide-react';

const DigitalPage = () => {
  return (
    <div className="py-2">
      <DataIntroCard title="Digital Presence" icon={Laptop}>
        <p>A summary of my online activity, including social media metrics, GitHub contributions, and other digital footprints. Content for this section will be available soon.</p>
      </DataIntroCard>
    </div>
  );
};

export default DigitalPage;