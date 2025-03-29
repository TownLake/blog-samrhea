import React from 'react';
import Card from '../Card';
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
      I publish my health data to track progress over time and maintain accountability. 
      This dashboard represents key metrics from my wearables and fitness activities, 
      showing both daily fluctuations and long-term trends.
    </p>
  </Card>
);

export default HealthIntroCard;