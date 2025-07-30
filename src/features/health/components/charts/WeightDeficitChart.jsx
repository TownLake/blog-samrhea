// src/features/health/components/charts/WeightDeficitChart.jsx
import React, { memo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import useDarkMode from '/src/hooks/useDarkMode.js';
import { chartMargins, axisConfig, gridConfig } from '/src/config/chartConfig.js';
import Tooltip from '/src/components/ui/Tooltip.jsx';

const WeightDeficitChart = memo(({ data, weightDomain }) => {
  const [isDarkMode] = useDarkMode();
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  const weightColor = isDarkMode ? '#a78bfa' : '#8b5cf6'; // purple-400, purple-500
  const deficitColor = isDarkMode ? '#60a5fa' : '#3b82f6'; // blue-400, blue-500

  const renderCustomTooltip = (payload) => {
    if (!payload || !payload.active || !payload.payload || !payload.payload[0]) {
      return null;
    }
    const point = payload.payload[0].payload;
    const date = new Date(point.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{date}</p>
        <div className="space-y-1">
          <p className="font-medium" style={{ color: deficitColor }}>
            14d Deficit: {point.cumulativeDeficit?.toLocaleString()} kcal
          </p>
          <p className="font-medium" style={{ color: weightColor }}>
            Weight: {point.weight?.toFixed(1)} lbs
          </p>
        </div>
      </div>
    );
  };

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400" style={{height: '350px'}}>
        Not enough data to show relationship between weight and calorie deficit.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={chartMargins.daily}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColors.stroke} />
        <XAxis
          dataKey="date"
          stroke={axisColors.stroke}
          tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          tick={{ fill: axisColors.tickFill, fontSize: 12 }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          interval={7} // Show a tick roughly every 7 days
          minTickGap={30}
        />
        <YAxis
          yAxisId="left"
          dataKey="cumulativeDeficit"
          orientation="left"
          stroke={deficitColor}
          tick={{ fill: deficitColor, fontSize: 12 }}
          tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
          width={45}
        />
        <YAxis
          yAxisId="right"
          dataKey="weight"
          orientation="right"
          stroke={weightColor}
          tick={{ fill: weightColor, fontSize: 12 }}
          width={45}
          domain={weightDomain} // Use the new domain prop here
        />
        <RechartsTooltip content={renderCustomTooltip} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <ReferenceLine y={0} yAxisId="left" stroke={axisColors.stroke} strokeDasharray="2 4" />
        <Bar yAxisId="left" dataKey="cumulativeDeficit" fill={deficitColor} name="14-Day Cumulative Deficit" barSize={20} />
        <Line yAxisId="right" type="monotone" dataKey="weight" stroke={weightColor} strokeWidth={2} name="Weight" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

WeightDeficitChart.displayName = 'WeightDeficitChart';
export default WeightDeficitChart;
