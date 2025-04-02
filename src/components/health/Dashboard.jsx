// src/components/health/Dashboard.jsx
import React from 'react';
import { Heart, Scale, Activity, Hourglass, Waves, Ruler, HeartPulse, ClipboardCheck,
         Footprints, Wind, Timer, BedDouble, PlugZap } from 'lucide-react';
import MetricCard from './MetricCard';
import { useHealthData } from '../../store/HealthDataContext';
import { createSparklineData, hasValidData, formatSecondsToMMSS } from '../../utils/dataUtils';
import { getMetricCategoryInfo } from '../../utils/healthCategories';
import MetricSection from './MetricSection';
import HealthIntroCard from './HealthIntroCard';
import Card from '../Card';
import useDarkMode from '../../hooks/useDarkMode';

// Loading state component
const LoadingView = () => (
  <div className="py-20 text-center text-gray-500 dark:text-gray-400">
    <p>Loading health data...</p>
  </div>
);

// Error display component
const ErrorView = ({ message }) => (
  <div className="py-10 max-w-xl mx-auto text-center">
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        Unable to Load Health Data
      </h2>
      <p className="text-gray-700 dark:text-gray-300">{message || 'An error occurred while loading your health data.'}</p>
    </Card>
  </div>
);

const Dashboard = () => {
  const [isDarkMode] = useDarkMode(); // Keep this if needed elsewhere, otherwise removable
  const {
    ouraData,
    withingsData,
    runningData,
    isLoading,
    error,
  } = useHealthData();

  if (isLoading) {
    return <LoadingView />;
  }

  // Use improved hasValidData check if desired (checking oura OR withings)
  if (!hasValidData(ouraData, withingsData) && !runningData?.length > 0) { // Check running data too
    return <ErrorView message={error || 'No health data available'} />;
  }

  return (
    <div className="pt-2 pb-8">
      {/* Conditionally render error view if there was an error but some data might still exist */}
      {error && !isLoading && <ErrorView message={error} />}

      <HealthIntroCard />

      <div className="space-y-10">
        {/* --- HEART Section --- */}
        {(ouraData && ouraData.length > 0) && ( // Conditionally render section if data exists
          <MetricSection
            title="Heart"
            icon={Heart}
            metrics={[
              {
                title: "HRV",
                value: ouraData[0]?.average_hrv?.toFixed(0) ?? '--',
                unit: "ms",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('average_hrv', ouraData[0]?.average_hrv),
                sparklineData: createSparklineData(ouraData, 'average_hrv'),
                icon: Activity,
                fullData: ouraData,
                dataKey: "average_hrv"
              },
              {
                title: "Resting Heart Rate",
                value: ouraData[0]?.resting_heart_rate?.toFixed(0) ?? '--',
                unit: "bpm",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('resting_heart_rate', ouraData[0]?.resting_heart_rate),
                sparklineData: createSparklineData(ouraData, 'resting_heart_rate'),
                icon: HeartPulse,
                fullData: ouraData,
                dataKey: "resting_heart_rate"
              }
            ]}
          />
        )}

        {/* --- BODY Section --- */}
        {(withingsData && withingsData.length > 0) && ( // Conditionally render section
          <MetricSection
            title="Body"
            icon={ClipboardCheck}
            metrics={[
              {
                title: "Weight",
                value: withingsData[0]?.weight?.toFixed(1) ?? '--',
                unit: "lbs",
                // Weight doesn't have a defined category, use default
                textColorClass: "text-gray-500 dark:text-gray-400",
                hexColor: "#a1a1aa",
                category: "default",
                label: "No Category",
                sparklineData: createSparklineData(withingsData, 'weight'),
                icon: Scale,
                fullData: withingsData,
                dataKey: "weight"
              },
              {
                title: "Body Fat",
                value: withingsData[0]?.fat_ratio?.toFixed(1) ?? '--',
                unit: "%",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('fat_ratio', withingsData[0]?.fat_ratio),
                sparklineData: createSparklineData(withingsData, 'fat_ratio'),
                icon: Ruler,
                fullData: withingsData,
                dataKey: "fat_ratio"
              }
            ]}
          />
        )}

        {/* --- SLEEP Section --- */}
        {(ouraData && ouraData.length > 0) && ( // Conditionally render section
          <MetricSection
            title="Sleep"
            icon={BedDouble}
            metrics={[
              {
                title: "Total Sleep",
                value: ouraData[0]?.total_sleep?.toFixed(1) ?? '--',
                unit: "h",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('total_sleep', ouraData[0]?.total_sleep),
                sparklineData: createSparklineData(ouraData, 'total_sleep'),
                icon: BedDouble,
                fullData: ouraData,
                dataKey: "total_sleep"
              },
              {
                title: "Deep Sleep",
                value: ouraData[0]?.deep_sleep_minutes?.toFixed(0) ?? '--',
                unit: "min",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('deep_sleep_minutes', ouraData[0]?.deep_sleep_minutes),
                sparklineData: createSparklineData(ouraData, 'deep_sleep_minutes'),
                icon: Waves,
                fullData: ouraData,
                dataKey: "deep_sleep_minutes"
              },
              {
                title: "Sleep Efficiency",
                value: ouraData[0]?.efficiency?.toFixed(0) ?? '--',
                unit: "%",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('efficiency', ouraData[0]?.efficiency),
                sparklineData: createSparklineData(ouraData, 'efficiency'),
                icon: PlugZap,
                fullData: ouraData,
                dataKey: "efficiency"
              },
              {
                title: "Sleep Delay",
                value: ouraData[0]?.delay?.toFixed(0) ?? '--',
                unit: "min",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('delay', ouraData[0]?.delay),
                sparklineData: createSparklineData(ouraData, 'delay'),
                icon: Hourglass,
                fullData: ouraData,
                dataKey: "delay"
              }
            ]}
          />
        )}

        {/* --- RUNNING Section --- */}
        {(runningData && runningData.length > 0) && ( // Conditionally render section
          <MetricSection
            title="Running"
            icon={Footprints}
            metrics={[
              {
                title: "VO2 Max",
                value: runningData[0]?.vo2_max?.toFixed(1) ?? '--',
                unit: "",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('vo2_max', runningData[0]?.vo2_max),
                sparklineData: createSparklineData(runningData, 'vo2_max'),
                icon: Wind,
                fullData: runningData,
                dataKey: "vo2_max"
              },
              {
                title: "5K Time",
                value: runningData[0]?.five_k_formatted ?? '--',
                unit: "",
                // Get category info instead of trend info
                ...getMetricCategoryInfo('five_k_seconds', runningData[0]?.five_k_seconds),
                sparklineData: createSparklineData(runningData, 'five_k_seconds'),
                icon: Timer,
                fullData: runningData,
                dataKey: "five_k_seconds"
              }
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;