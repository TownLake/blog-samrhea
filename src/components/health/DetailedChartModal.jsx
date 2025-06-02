// src/components/health/DetailedChartModal.jsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { X, BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { createMonthlyAverageData, createDetailChartData } from '../../utils/dataUtils';
import { getMetricCategoryInfo } from '../../utils/healthCategories';
import DailyChart from './charts/DailyChart';
import MonthlyChart from './charts/MonthlyChart';

const DetailedChartModal = memo(({ isOpen, onClose, title, data, dataKey, unit, icon: Icon, lineColor }) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [isDarkMode] = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      console.log(`[DetailedChartModal] Rendering for "${title}". View mode: ${viewMode}`);
    }
  }, [isOpen, title, viewMode]);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return createDetailChartData(data);
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return createMonthlyAverageData(data, dataKey);
  }, [data, dataKey]);

  // --- REFACTORED: Centralized Y-axis domain calculation ---
  const dailyChartDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return [0, 100];
    
    const values = chartData.map(d => d[dataKey]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return [0, 100];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Use a sensible padding: 20% of the data range, with a minimum of 2 units.
    const padding = Math.max((max - min) * 0.2, 2);
    
    return [min - padding, max + padding];
  }, [chartData, dataKey]);

  const monthlyChartDomain = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [0, 100];
    
    const values = monthlyData.map(d => d.average).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return [0, 100];
    
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Use the same sensible padding logic.
    const padding = Math.max((max - min) * 0.2, 2);

    return [min - padding, max + padding];
  }, [monthlyData]);
  // ---

  const currentValue = data && data.length > 0 ? data[0][dataKey] : null;
  const { hexColor: categoryColor } = getMetricCategoryInfo(dataKey, currentValue);
  
  const effectiveLineColor = lineColor || categoryColor;

  if (!isOpen) return null;

  const toggleView = () => {
    setViewMode(currentMode => {
      const newMode = currentMode === 'daily' ? 'monthly' : 'daily';
      console.log(`[DetailedChartModal] Toggling view for "${title}" from ${currentMode} to ${newMode}`);
      return newMode;
    });
  };

  const modalBackgroundClass = isDarkMode ? 'bg-slate-800' : 'bg-white';

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${dataKey}`}
      onClick={onClose}
    >
      <div
        className={`${modalBackgroundClass} rounded-xl w-full max-w-4xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            <h2 id={`modal-title-${dataKey}`} className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            {unit && <span className="text-sm text-gray-500 dark:text-gray-400">({unit})</span>}
          </div>
          <div className="flex items-center gap-2">
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
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors" 
              aria-label="Close detail view"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[400px] w-full">
          {viewMode === 'daily' ? (
            <DailyChart
              chartData={chartData}
              dataKey={dataKey}
              unit={unit}
              lineColor={effectiveLineColor}
              domain={dailyChartDomain} // Pass calculated domain
              isDarkMode={isDarkMode}
            />
          ) : (
            <MonthlyChart
              monthlyData={monthlyData}
              unit={unit}
              domain={monthlyChartDomain} // Pass calculated domain
              dataKey={dataKey}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
});

DetailedChartModal.displayName = 'DetailedChartModal';

export default DetailedChartModal;