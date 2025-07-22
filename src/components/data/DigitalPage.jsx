// src/components/data/DigitalPage.jsx
import React from 'react';
import Card from '../Card';
import { Laptop } from 'lucide-react';

const DigitalPage = () => {
  return (
    <div className="py-2">
      {/* Replicating DataIntroCard's structure directly */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Laptop className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Digital
          </h2>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <p>Hold.</p>
        </div>
      </Card>
    </div>
  );
};

export default DigitalPage;
