// src/components/data/health/MetricCard.jsx
import React, { memo, useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import Card from '../../Card';
import SparklineTooltip from './tooltips/SparklineTooltip';
import DetailedChartModal from './DetailedChartModal';
import { CATEGORY_COLORS } from '../../../utils/healthCategories';

// A simple, self-contained hook to check for a media query match.
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    // Use the modern addEventListener syntax
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};


const MetricCard = memo(({
  title,
  value,
  unit,
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
  displayMode = 'full',
}) => {
  const gradientId = useMemo(() => `sparkline-${dataKey}-gradient`, [dataKey]);
  const sparklineColor = hexColor;
  const isDesktop = useMediaQuery('(min-width: 768px)');

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

  // On desktop, always use the 'full' layout. On mobile, respect the displayMode.
  const useFullLayout = isDesktop || displayMode === 'full';

  return (
    <>
      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`View details for ${title}`}
      >
        {useFullLayout ? (
          <>
            {/* Full Layout (Desktop or specified) */}
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
              {Icon && <Icon className="w-5 h-5 mr-2" />}
              <span className="text-sm">{title}</span>
            </div>
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
            {/* Compact Layout (Mobile only) */}
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />}
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
            </div>
            <div className="w-full h-10 my-2">
              {renderSparkline()}
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
                {unit && <span className="text-gray-400 dark:text-gray-500 text-lg ml-1">{unit}</span>}
              </div>
              {label && <div className={`text-xs ${textColorClass}`}>{label}</div>}
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