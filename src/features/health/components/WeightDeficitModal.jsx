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
        <WeightDeficitChart data={data} weightDomain={[155, 168]} />
      </div>
    </ChartModal>
  );
});

WeightDeficitModal.displayName = 'WeightDeficitModal';
export default WeightDeficitModal;
