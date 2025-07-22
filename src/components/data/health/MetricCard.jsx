// src/components/data/health/MetricCard.jsx
import React, { memo, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import Card from '../../Card';
import SparklineTooltip from './tooltips/SparklineTooltip';
import DetailedChartModal from './DetailedChartModal';
import { CATEGORY_COLORS } from '../../../utils/healthCategories';

const MetricCard = memo(({
  title,
  value,
  unit,
  category = 'default',
  label = null,
  textColorClass = 'text-gray-500 dark:text-gray-400',
  sparklineData,
  icon: Icon,
  hexColor = CATEGORY_COLORS.default,
  fullData,
  dataKey,
  isOpen,
  onOpen,
  onClose,
  displayMode = 'full', // NEW: 'full' or 'compact'
}) => {
  const gradientId = useMemo(() => `sparkline-${dataKey}-gradient`, [dataKey]);
  const sparklineColor = hexColor;

  const renderSparkline = () => (
    sparklineData && sparklineData.length > 0 && (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={sparklineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={sparklineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip
            content={<SparklineTooltip dataKey={dataKey} />}
            cursor={{ stroke: sparklineColor, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={sparklineColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  );

  return (
    <>
      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`View details for ${title}`}
      >
        {displayMode === 'full' ? (
          <>
            {/* Full Layout: Header */}
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
              {Icon && <Icon className="w-5 h-5 mr-2" />}
              <span className="text-sm">{title}</span>
            </div>
            {/* Full Layout: Body */}
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-4xl font-semibold text-gray-900 dark:text-white">
                  {value}
                  {unit && <span className="text-gray-400 dark:text-gray-500 text-2xl ml-1">{unit}</span>}
                </div>
                {label && <div className={`text-sm ${textColorClass}`}>{label}</div>}
              </div>
              <div className="w-32 h-16">{renderSparkline()}</div>
            </div>
          </>
        ) : (
          <>
            {/* Compact Layout */}
            <div className="flex justify-between items-center h-full w-full">
              <div className="flex flex-col justify-center space-y-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {value}
                  {unit && <span className="text-gray-400 dark:text-gray-500 text-xl ml-1">{unit}</span>}
                </div>
                {label && <div className={`text-xs ${textColorClass}`}>{label}</div>}
              </div>
              <div className="w-20 h-12 -mr-2">{renderSparkline()}</div>
            </div>
          </>
        )}
      </Card>

      <DetailedChartModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        data={fullData}
        dataKey={dataKey}
        unit={unit}
        icon={Icon}
        lineColor={sparklineColor}
      />
    </>
  );
});

MetricCard.displayName = 'MetricCard';
export default MetricCard;