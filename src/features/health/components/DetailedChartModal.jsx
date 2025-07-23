// src/features/health/components/DetailedChartModal.jsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon, Layers, Info } from 'lucide-react';
import useDarkMode from '/src/hooks/useDarkMode.js';
import { createMonthlyAverageData, createDetailChartData } from '/src/utils/dataUtils.js';
import { METRIC_INFO } from '/src/config/metricInfo.js';
import DailyChart from '/src/features/health/components/charts/DailyChart.jsx';
import MonthlyChart from '/src/features/health/components/charts/MonthlyChart.jsx';
import ChartModal from '/src/components/ui/ChartModal.jsx';

const DetailedChartModal = memo(({
  isOpen,
  onClose,
  title,
  data,
  dataKey,
  unit,
  icon: Icon,
}) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [showBands, setShowBands] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode] = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      setViewMode('monthly');
      setShowBands(false);
      setShowInfo(false);
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

  const metricInfo = METRIC_INFO[dataKey] || METRIC_INFO[dataKey.replace('_clinical', '')] || METRIC_INFO.default;
  const neutralLineColor = isDarkMode ? '#94a3b8' : '#475569';

  const headerActionsContent = (
    <div className="flex items-center gap-1">
      <button onClick={() => setShowInfo(prev => !prev)} className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`} aria-label="Show metric information" title="Metric Info">
        <Info className={`w-5 h-5 ${showInfo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
      </button>
      <button onClick={() => setShowBands(prev => !prev)} className={`p-2 rounded-full transition-colors ${showBands ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`} aria-label="Toggle category bands" title="Toggle Category Bands">
        <Layers className={`w-5 h-5 ${showBands ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
      </button>
      <button onClick={() => setViewMode(prev => (prev === 'daily' ? 'monthly' : 'daily'))} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label={viewMode === 'daily' ? 'Switch to monthly view' : 'Switch to daily view'} title={viewMode === 'daily' ? 'Monthly View' : 'Daily View'}>
        {viewMode === 'daily' ? <BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <LineChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
      </button>
    </div>
  );

  if (!isOpen || !dataKey) return null;

  return (
    <ChartModal isOpen={isOpen} onClose={onClose} title={title} unit={unit} icon={Icon} headerActions={headerActionsContent}>
      <div className="h-[350px] sm:h-[400px] w-full">
        {viewMode === 'daily' ? (
          <DailyChart chartData={chartData} dataKey={dataKey} unit={unit} lineColor={neutralLineColor} domain={dailyChartDomain} isDarkMode={isDarkMode} showBands={showBands} />
        ) : (
          <MonthlyChart monthlyData={monthlyData} unit={unit} domain={monthlyChartDomain} dataKey={dataKey} isDarkMode={isDarkMode} showBands={showBands} />
        )}
      </div>

      {showInfo && (
        <div className="mt-4 p-4 border-t border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out animate-fade-in">
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">{metricInfo.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{metricInfo.description}</p>
        </div>
      )}
    </ChartModal>
  );
});

DetailedChartModal.displayName = 'DetailedChartModal';
export default DetailedChartModal;