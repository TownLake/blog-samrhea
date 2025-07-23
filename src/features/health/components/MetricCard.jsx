// src/features/health/components/MetricCard.jsx
import React, { memo, useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip } from 'recharts';
import Card from '/src/components/ui/Card.jsx';
import DetailedChartModal from '/src/features/health/components/DetailedChartModal.jsx';
import Tooltip from '/src/components/ui/Tooltip.jsx';
import { CATEGORY_COLORS, getMetricCategoryInfo } from '/src/utils/healthCategories.js';
import { formatSecondsToMMSS } from '/src/utils/dataUtils.js';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
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

  const renderSparklineTooltip = (dataPoint) => {
    if (!dataPoint) return null;

    const pointValue = dataPoint.value;
    const isFilled = dataPoint.isFilled;
    const date = dataPoint.date;

    if (pointValue === null || pointValue === undefined) return null;

    const displayValue = dataKey === 'five_k_seconds' ? formatSecondsToMMSS(pointValue) : pointValue?.toFixed(1) ?? '--';
    const formattedDate = date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(dataKey, pointValue);

    return (
      <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{formattedDate}</p>
        <p className="text-gray-900 dark:text-white text-sm font-medium">
          {displayValue}
          {isFilled && <span className="text-xs ml-1 text-gray-500">*</span>}
        </p>
        <p className={`text-xs ${textColorClass}`}>{categoryLabel}</p>
      </div>
    );
  };

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
          <RechartsTooltip
            content={<Tooltip renderContent={renderSparklineTooltip} />}
            cursor={{ stroke: sparklineColor, strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} isAnimationActive={false} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
  );

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
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />}
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
            </div>
            <div className="w-full h-10 my-2">{renderSparkline()}</div>
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

      <DetailedChartModal isOpen={isOpen} onClose={onClose} title={title} data={fullData} dataKey={dataKey} unit={unit} icon={Icon} lineColor={sparklineColor} />
    </>
  );
});

MetricCard.displayName = 'MetricCard';
export default MetricCard;