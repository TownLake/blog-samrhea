// src/components/data/health/DetailedChartModal.jsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon } from 'lucide-react'; // X is now handled by ChartModal
import useDarkMode from '../../../hooks/useDarkMode'; // Adjusted path
import { createMonthlyAverageData, createDetailChartData } from '../../../utils/dataUtils'; // Adjusted path
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Adjusted path
import DailyChart from './charts/DailyChart';
import MonthlyChart from './charts/MonthlyChart';
import ChartModal from '../../modals/ChartModal'; // Import the generic modal

const DetailedChartModal = memo(({
  isOpen,
  onClose,
  title,
  data,
  dataKey,
  unit,
  icon: Icon, // This is the icon for the specific metric
  lineColor
}) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [isDarkMode] = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      // When modal opens, reset to monthly view or a preferred default
      setViewMode('monthly');
      console.log(`[DetailedChartModal] Rendering for "${title}". Default view mode: monthly`);
    }
  }, [isOpen, title]);


  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return createDetailChartData(data);
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return createMonthlyAverageData(data, dataKey);
  }, [data, dataKey]);

  const dailyChartDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return [0, 100];
    const values = chartData.map(d => d[dataKey]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.2, (max === min ? 5 : 2)); // Ensure some padding if min=max
    return [min - padding, max + padding];
  }, [chartData, dataKey]);

  const monthlyChartDomain = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [0, 100];
    const values = monthlyData.map(d => d.average).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.2, (max === min ? 5 : 2));
    return [min - padding, max + padding];
  }, [monthlyData]);

  const currentValue = data && data.length > 0 && data[0] && data[0][dataKey] !== undefined ? data[0][dataKey] : null;
  const { hexColor: categoryColor } = getMetricCategoryInfo(dataKey, currentValue);
  const effectiveLineColor = lineColor || categoryColor;

  const toggleView = () => {
    setViewMode(currentMode => {
      const newMode = currentMode === 'daily' ? 'monthly' : 'daily';
      console.log(`[DetailedChartModal] Toggling view for "${title}" from ${currentMode} to ${newMode}`);
      return newMode;
    });
  };

  const headerActionsContent = (
    <>
      {unit && <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:inline">({unit})</span>}
      <button
        onClick={toggleView}
        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        aria-label={viewMode === 'daily' ? 'Switch to monthly view' : 'Switch to daily view'}
      >
        {viewMode === 'daily' ?
          <BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400" /> :
          <LineChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        }
      </button>
    </>
  );

  // If not open or no dataKey (can happen during fast transitions), don't render
  if (!isOpen || !dataKey) return null;

  return (
    <ChartModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Icon} // Pass the metric's specific icon to the generic modal
      headerActions={headerActionsContent}
    >
      <div className="h-[350px] sm:h-[400px] w-full"> {/* Fixed height for chart area */}
        {viewMode === 'daily' ? (
          <DailyChart
            chartData={chartData}
            dataKey={dataKey}
            unit={unit}
            lineColor={effectiveLineColor}
            domain={dailyChartDomain}
            isDarkMode={isDarkMode}
          />
        ) : (
          <MonthlyChart
            monthlyData={monthlyData}
            unit={unit}
            domain={monthlyChartDomain}
            dataKey={dataKey}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </ChartModal>
  );
});

DetailedChartModal.displayName = 'DetailedChartModal';
export default DetailedChartModal;