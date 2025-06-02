// src/components/data/health/HealthIntroCard.jsx

import React from 'react';
import Card from '../../Card';
import { BarChart2 } from 'lucide-react';

const HealthIntroCard = () => (
  <Card className="mb-6 p-6">
    <div className="flex items-center gap-2 mb-3">
      <BarChart2 className="w-5 h-5 text-blue-500" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Health Data
      </h2>
    </div>
    
    <p className="text-gray-700 dark:text-gray-300">
      I publish these to have a home page for myself. I think{' '} 
      <a href="https://blog.samrhea.com/post/2024-01-30-health-data" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        a lot
      </a> about this kind of data. And, if you're like me, you could use this{' '} 
      <a href="https://github.com/TownLake/core-health" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        open-sourced dashboard
      </a> I built, too.
    </p>
  </Card>
);

export default HealthIntroCard;