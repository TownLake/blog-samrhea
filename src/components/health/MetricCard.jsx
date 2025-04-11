// src/components/health/MetricCard.jsx
import React, { useState, memo, useMemo, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import Card from '../Card'; // Adjust path
import SparklineTooltip from './tooltips/SparklineTooltip'; // Adjust path
import DetailedChartModal from './DetailedChartModal'; // Adjust path
import { defaultTrendColor } from '../../config/chartConfig'; // Adjust path
import { CATEGORY_COLORS } from '../../utils/healthCategories'; // Import category colors
import { createSparklineData } from '../../utils/dataUtils'; // Import our new utility

const MetricCard = memo(({
  title,
  value,
  unit,
  category = 'default', // New prop for the category
  label = null, // New prop for the category label
  textColorClass = 'text-gray-500 dark:text-gray-400', // Default text color class
  sparklineData: providedSparklineData, // Original sparkline data prop (might be null)
  icon: Icon,
  hexColor = CATEGORY_COLORS.default, // Use category color instead of trend color
  fullData, // Full dataset needed for the modal
  dataKey
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Debug Logging ---
  useEffect(() => {
    console.log(`[MetricCard DEBUG] Modal state for "${title}" changed to:`, isModalOpen);
  }, [isModalOpen, title]);
  // ---

  const gradientId = useMemo(() => `sparkline-${dataKey}-gradient`, [dataKey]);

  // Generate sparkline data for the last 45 days
  const sparklineData = useMemo(() => {
    // Use provided data if available, otherwise generate from fullData
    if (providedSparklineData && Array.isArray(providedSparklineData) && providedSparklineData.length > 0) {
      return providedSparklineData;
    }
    // Generate last 45 days of data
    return createSparklineData(fullData, dataKey);
  }, [providedSparklineData, fullData, dataKey]);

  // Process sparkline data to ensure it has the isFilled flag
  const processedSparklineData = useMemo(() => {
    if (!sparklineData || !Array.isArray(sparklineData)) return [];
    
    return sparklineData.map(item => {
      // If we already have isFilled flag on the item, use it
      if (item.hasOwnProperty('isFilled')) {
        return item;
      }
       
      // Otherwise, check if we can find this date in the fullData for its fill status
      const matchingDataPoint = fullData?.find(dataPoint => 
        dataPoint.date === item.date
      );
      
      let isFilled = false;
      if (matchingDataPoint) {
        const fillValueKey = `is_fill_value_${dataKey?.split('_')[0]}`;
        isFilled = !!matchingDataPoint[fillValueKey];
      }
      
      return { ...item, isFilled };
    });
  }, [sparklineData, fullData, dataKey]);

  const sparklineColor = hexColor; // Use category color for sparkline

  const handleCardClick = () => {
      console.log(`[MetricCard DEBUG] Clicked on card: "${title}". Setting modal open state.`);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      console.log(`[MetricCard DEBUG] Closing modal for "${title}"`);
      setIsModalOpen(false);
  }

  return (
    <>
      <Card
        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        onClick={handleCardClick}
        aria-haspopup="dialog"
        aria-label={`View details for ${title}`}
      >
        {/* Header */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          <span className="text-sm">{title}</span>
        </div>

        {/* Body: Value, Category, Sparkline */}
        <div className="flex justify-between items-end">
          {/* Value and Category Label */}
          <div className="space-y-1">
            <div className="text-4xl font-semibold text-gray-900 dark:text-white">
              {value}
              {unit && <span className="text-gray-400 dark:text-gray-500 text-2xl ml-1">{unit}</span>}
            </div>
            {label && <div className={`text-sm ${textColorClass}`}>
              {label}
            </div>}
          </div>

          {/* Sparkline Area - Using Tailwind classes for size */}
          {processedSparklineData && processedSparklineData.length > 0 && (
            <div className="w-32 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedSparklineData}>
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
                    type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={2}
                    fillOpacity={1} fill={`url(#${gradientId})`}
                    dot={(props) => {
                      if (props.payload.isFilled) return <circle cx={props.cx} cy={props.cy} r={2} fill={sparklineColor} fillOpacity={0.5}/>;
                      return null;
                    }}
                    isAnimationActive={false} connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* Render Modal */}
      <DetailedChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={title}
        data={fullData}
        dataKey={dataKey}
        unit={unit}
        icon={Icon}
        lineColor={sparklineColor} // Pass category color for chart line
      />
    </>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;