// src/components/data/health/DetailedChartModal.jsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { createMonthlyAverageData, createDetailChartData } from '../../../utils/dataUtils';
import { getMetricCategoryInfo } from '../../../utils/healthCategories';
import DailyChart from './charts/DailyChart';
import MonthlyChart from './charts/MonthlyChart';
import ChartModal from '../../modals/ChartModal';

const DetailedChartModal = memo(({
  isOpen,
  onClose,
  title,
  data,
  dataKey,
  unit, // Unit will be passed to ChartModal
  icon: Icon,
  lineColor
}) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [isDarkMode] = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      setViewMode('monthly');
    }
  }, [isOpen]);

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
    const padding = Math.max((max - min) * 0.2, (max === min ? 5 : 2));
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
    setViewMode(currentMode => (currentMode === 'daily' ? 'monthly' : 'daily'));
  };

  const headerActionsContent = (
    // REMOVED unit from here
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
  );

  if (!isOpen || !dataKey) return null;

  return (
    <ChartModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      unit={unit} // PASS unit to ChartModal
      icon={Icon}
      headerActions={headerActionsContent}
    >
      <div className="h-[350px] sm:h-[400px] w-full">
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