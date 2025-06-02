// src/components/data/health/charts/DailyChart.jsx
import React, { memo, useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSecondsToMMSS } from '../../../../utils/dataUtils'; // Adjust path as needed
import CustomTooltip from '../tooltips/CustomTooltip'; // Adjust path as needed
import { chartMargins, axisConfig, gridConfig } from '../../../../config/chartConfig'; // Adjust path as needed

const DailyChart = memo(({
  chartData: initialChartData,
  dataKey,
  unit,
  lineColor,
  domain, // UPDATED: Accept final domain directly
  isDarkMode
}) => {
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;
  const effectiveLineColor = lineColor || "#3B82F6";

  const gradientId = `detailGradient-${dataKey}`;
  const filledGradientId = `detailGradientFilled-${dataKey}`;

  // --- Data Processing logic remains the same to split actual vs. filled ---
  const { processedChartData, actualDataKey, filledDataKey } = useMemo(() => {
    if (!initialChartData || !Array.isArray(initialChartData)) {
        return { processedChartData: [], actualDataKey: `${dataKey}_actual`, filledDataKey: `${dataKey}_filled` };
    }

    const actualKey = `${dataKey}_actual`;
    const filledKey = `${dataKey}_filled`;
    const dataKeyBase = dataKey?.split('_')[0];
    const fillFlagKey = `is_fill_value_${dataKeyBase}`;

    const processed = initialChartData.map(point => {
        if (!point || typeof point !== 'object') return null;

        const hasDataKeyValue = point.hasOwnProperty(dataKey) && point[dataKey] !== null && point[dataKey] !== undefined;
        const isFilled = point.hasOwnProperty(fillFlagKey) && !!point[fillFlagKey];

        return {
            ...point,
            [actualKey]: hasDataKeyValue && !isFilled ? point[dataKey] : null,
            [filledKey]: hasDataKeyValue && isFilled ? point[dataKey] : null,
        };
    }).filter(Boolean);

    const uniqueData = Array.from(new Map(processed.map(item => [item.date, item])).values());
    return { processedChartData: uniqueData, actualDataKey: actualKey, filledDataKey: filledKey };
  }, [initialChartData, dataKey]);

  const hasSufficientData = processedChartData && processedChartData.length >= 2;

  if (!hasSufficientData) {
     return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for daily view.</div>;
  }

  // --- REMOVED: Redundant min/max/padding calculation is gone ---

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedChartData} margin={chartMargins.daily}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={effectiveLineColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={effectiveLineColor} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id={filledGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={effectiveLineColor} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={effectiveLineColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={gridColors.stroke}
        />
        <XAxis
          dataKey="date"
          stroke={axisColors.stroke}
          tickFormatter={(dateString) => {
              try {
                  const dateObj = new Date(dateString);
                  if (isNaN(dateObj.getTime())) return '';
                  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              } catch (e) {
                  console.error("Error formatting date:", dateString, e);
                  return '';
              }
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
        />
        <YAxis
          stroke={axisColors.stroke}
          domain={domain} // Use the domain passed via props
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return typeof value === 'number' ? `${Math.round(value)}` : '';
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          allowDataOverflow={true} // Important for custom domains
          width={40} // Give Y-axis enough space
        />
        <Tooltip content={<CustomTooltip unit={unit} originalDataKey={dataKey} actualDataKey={actualDataKey} filledDataKey={filledDataKey}/>} />

        {/* Area for filled values (drawn first, in the back) */}
        <Area
          type="monotone"
          dataKey={filledDataKey}
          stroke="none"
          strokeWidth={0}
          fillOpacity={1}
          fill={`url(#${filledGradientId})`}
          dot={false}
          activeDot={false}
          name="Filled Data"
          connectNulls={false}
          isAnimationActive={false}
        />
        {/* Area for actual values (drawn on top) */}
        <Area
          type="monotone"
          dataKey={actualDataKey}
          stroke={effectiveLineColor}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 6, stroke: effectiveLineColor, strokeWidth: 2, fill: isDarkMode ? '#1E293B' : '#FFFFFF' }}
          name="Actual Data"
          connectNulls={true} // *** FIX: This connects the line across gaps with 'filled' data ***
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

DailyChart.displayName = 'DailyChart';

export default DailyChart;