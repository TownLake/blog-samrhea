// src/components/data/health/charts/MonthlyChart.jsx
import React, { memo, useMemo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { formatSecondsToMMSS } from '../../../../utils/dataUtils';
import { getMetricCategoryInfo, METRIC_RANGES, CATEGORY_COLORS } from '../../../../utils/healthCategories';
import { chartMargins, monthlyChartConfig, axisConfig, gridConfig } from '../../../../config/chartConfig';
import Tooltip from '../../../ui/Tooltip'; // Import the new unified tooltip

const MonthlyChart = memo(({ monthlyData, unit, domain, dataKey, isDarkMode, showBands }) => {
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  const processedData = useMemo(() => {
    if (!monthlyData || !monthlyData.length) return [];
    
    return monthlyData.map(monthItem => {
      const { hexColor } = getMetricCategoryInfo(dataKey, monthItem.average);
      return {
        ...monthItem,
        color: hexColor
      };
    });
  }, [monthlyData, dataKey]);

  const categoryRanges = METRIC_RANGES[dataKey] || METRIC_RANGES[dataKey.replace('_clinical', '')] || [];

  const renderCustomTooltip = (dataPoint) => {
    if (!dataPoint) return null;

    const value = dataPoint.average;
    if (value === null || value === undefined) return null;

    const displayValue = dataKey === 'five_k_seconds' ? formatSecondsToMMSS(value) : value?.toFixed(1) ?? '--';
    const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(dataKey, value);

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{dataPoint.monthName}</p>
        <p className="text-gray-900 dark:text-white font-semibold">
          {displayValue}{unit} <span className="text-sm font-normal">(avg)</span>
        </p>
        <p className={`text-xs mt-1 ${textColorClass}`}>{categoryLabel}</p>
        {dataPoint.count !== undefined && (
           <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            From {dataPoint.count} data points
          </p>
        )}
      </div>
    );
  };

  if (!processedData || processedData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for monthly view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={chartMargins.monthly} barGap={10}>
        
        {showBands && categoryRanges.map(range => {
          if (range.min === Infinity || !range.max) return null;
          return (
            <ReferenceArea
              key={range.category + range.min}
              y1={range.min}
              y2={range.max === Infinity ? domain[1] : range.max}
              fill={CATEGORY_COLORS[range.category]}
              fillOpacity={0.08}
              stroke={CATEGORY_COLORS[range.category]}
              strokeOpacity={0.2}
              strokeWidth={1}
              strokeDasharray="3 3"
              ifOverflow="hidden"
            />
          );
        })}

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColors.stroke} />
        <XAxis dataKey="monthName" stroke={axisColors.stroke} tick={{ fill: axisColors.tickFill }} tickLine={{ stroke: axisColors.stroke }} axisLine={{ stroke: axisColors.axisLine }} />
        <YAxis
          stroke={axisColors.stroke}
          domain={domain}
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return `${Math.round(value)}`;
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          allowDataOverflow={true}
          width={40}
        />
        {/* Use the new unified Tooltip component */}
        <RechartsTooltip content={<Tooltip renderContent={renderCustomTooltip} />} cursor={{fill: 'rgba(156, 163, 175, 0.1)'}}/>
        <Bar dataKey="average" fill="#a1a1aa" radius={[4, 4, 0, 0]} maxBarSize={monthlyChartConfig.maxBarSize} isAnimationActive={false} name={dataKey}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

MonthlyChart.displayName = 'MonthlyChart';
export default MonthlyChart;
