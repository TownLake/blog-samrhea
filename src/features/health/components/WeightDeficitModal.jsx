// src/features/health/components/WeightDeficitModal.jsx
import React, { memo } from 'react';
import { TrendingDown } from 'lucide-react';
import ChartModal from '/src/components/ui/ChartModal.jsx';
import WeightDeficitChart from './charts/WeightDeficitChart.jsx';

const WeightDeficitModal = memo(({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <ChartModal
      isOpen={isOpen}
      onClose={onClose}
      title="14-Day Cumulative Deficit vs. Weight"
      icon={TrendingDown}
    >
      <div className="h-[350px] sm:h-[400px] w-full">
        <WeightDeficitChart data={data} weightDomain={[130, 175]} />
      </div>
      <div className="mt-4 p-4 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">About this Chart</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          This chart visualizes the relationship between your body weight and your net calorie balance over the preceding 14 days.
          <br/><br/>
          A negative "Cumulative Deficit" (a surplus) often correlates with weight gain, while a positive deficit typically leads to weight loss over time. This helps illustrate the direct impact of calorie balance on weight trends.
        </p>
      </div>
    </ChartModal>
  );
});

WeightDeficitModal.displayName = 'WeightDeficitModal';
export default WeightDeficitModal;
