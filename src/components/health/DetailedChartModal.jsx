// src/components/health/DetailedChartModal.jsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { X, BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode'; // Adjust path
import { createMonthlyAverageData, createDetailChartData } from '../../utils/dataUtils'; // Import our updated utility functions
import { getMetricCategoryInfo } from '../../utils/healthCategories'; // Import category utility
import DailyChart from './charts/DailyChart'; // Adjust path
import MonthlyChart from './charts/MonthlyChart'; // Adjust path
// Note: Card component is not directly used here

const DetailedChartModal = memo(({ isOpen, onClose, title, data, dataKey, unit, icon: Icon, lineColor }) => {
  const [viewMode, setViewMode] = useState('monthly'); // Default to monthly
  const [isDarkMode] = useDarkMode();

  // --- Debug Logging ---
  useEffect(() => {
    if (isOpen) {
      console.log(`[DetailedChartModal DEBUG] Rendering for "${title}". Initial/Current viewMode state:`, viewMode);
    }
  }, [isOpen, title, viewMode]);
  // ---

  // --- Data Processing ---
  const chartData = useMemo(() => { // For DailyChart - Last 3 months
    if (!data || !Array.isArray(data)) return [];
    // Use our utility to get last 3 months of data
    // Then sort chronologically (oldest first) for the chart to display correctly
    return createDetailChartData(data).reverse();
  }, [data]);

  const monthlyData = useMemo(() => { // For MonthlyChart - using ALL data points
    if (!data || !Array.isArray(data)) return [];
    // We no longer filter out filled values here - include ALL data
    return createMonthlyAverageData(data, dataKey);
  }, [data, dataKey]);

  // --- Min/Max Calculations ---
  const dailyChartValues = useMemo(() => {
    if (!chartData || chartData.length === 0) return { minValue: 0, maxValue: 100, padding: 10 };
    const values = chartData.map(d => d[dataKey]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return { minValue: 0, maxValue: 100, padding: 10 };
    const min = Math.min(...values); const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.1, 5); // Ensure minimum padding
    return { minValue: min, maxValue: max, padding: pad };
  }, [chartData, dataKey]);

  const monthlyChartValues = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return { minValue: 0, maxValue: 100, padding: 10 };
    const values = monthlyData.map(d => d.average).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return { minValue: 0, maxValue: 100, padding: 10 };
    const min = Math.min(...values); const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.1, 5); // Ensure minimum padding
    return { minValue: min, maxValue: max, padding: pad };
  }, [monthlyData]);
  // ---

  // Get category for current value if available
  const currentValue = data && data.length > 0 ? data[0][dataKey] : null;
  const { hexColor: categoryColor } = getMetricCategoryInfo(dataKey, currentValue);
  
  // Use passed lineColor or fallback to category color
  const effectiveLineColor = lineColor || categoryColor;

  if (!isOpen) return null;

  const toggleView = () => {
    setViewMode(currentMode => {
      const newMode = currentMode === 'daily' ? 'monthly' : 'daily';
      console.log(`[DetailedChartModal DEBUG] Toggling view for "${title}" from ${currentMode} to ${newMode}`);
      return newMode;
    });
  };

  const modalBackgroundClass = isDarkMode ? 'bg-slate-800' : 'bg-white';

  console.log(`[DetailedChartModal DEBUG] Rendering ${viewMode === 'daily' ? 'DailyChart' : 'MonthlyChart'} for "${title}"`);

  return (
    // Consider using Headless UI or Radix Dialog for better a11y later
    <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${dataKey}`}
        onClick={onClose} // Close on backdrop click
       >
      <div
         className={`${modalBackgroundClass} rounded-xl w-full max-w-4xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700`}
         onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            <h2 id={`modal-title-${dataKey}`} className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            {unit && <span className="text-sm text-gray-500 dark:text-gray-400">({unit})</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleView} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label={viewMode === 'daily' ? 'Switch to monthly view' : 'Switch to daily view'}>
              {viewMode === 'daily' ? <BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <LineChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="Close detail view">
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Chart Area - Using Tailwind class for height */}
        <div className="h-[400px] w-full">
          {viewMode === 'daily' ? (
            <DailyChart
              chartData={chartData} 
              dataKey={dataKey}
              unit={unit}
              lineColor={effectiveLineColor}
              minValue={dailyChartValues.minValue}
              maxValue={dailyChartValues.maxValue}
              padding={dailyChartValues.padding}
              isDarkMode={isDarkMode} // Pass dark mode status
            />
          ) : (
            <MonthlyChart
              monthlyData={monthlyData}
              unit={unit}
              minValue={monthlyChartValues.minValue}
              maxValue={monthlyChartValues.maxValue}
              padding={monthlyChartValues.padding}
              dataKey={dataKey}
              isDarkMode={isDarkMode} // Pass dark mode status
            />
          )}
        </div>
      </div>
    </div>
  );
});

DetailedChartModal.displayName = 'DetailedChartModal';

export default DetailedChartModal;