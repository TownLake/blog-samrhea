import React, { memo, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import ChartModal from '/src/components/ui/ChartModal.jsx';
import WeightDeficitChart from './charts/WeightDeficitChart.jsx';

const WeightDeficitModal = memo(({ isOpen, onClose, data, weightDomain }) => {
  if (!isOpen) return null;

  const computedDomain = useMemo(() => {
    if (weightDomain && Array.isArray(weightDomain) && weightDomain.length === 2) {
      return weightDomain;
    }
    if (!Array.isArray(data) || data.length === 0) return [0, 100];
    const weights = data
      .map(d => (d && typeof d.weight === 'number' ? d.weight : null))
      .filter(v => v != null);
    if (weights.length < 2) return [0, 100];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const pad = Math.max((max - min) * 0.05, 1); // 5% or at least 1 unit
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [data, weightDomain]);

  return (
    <ChartModal
      isOpen={isOpen}
      onClose={onClose}
      title="14-Day Cumulative Deficit vs. Weight"
      icon={TrendingDown}
    >
      <div className="h-[350px] sm:h-[400px] w-full">
        <WeightDeficitChart data={data} weightDomain={computedDomain} />
      </div>
    </ChartModal>
  );
});

WeightDeficitModal.displayName = 'WeightDeficitModal';
export default WeightDeficitModal;
