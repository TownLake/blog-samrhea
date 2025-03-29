import React from 'react';
import { Heart, Scale, Activity, Hourglass, Waves, Ruler, HeartPulse, ClipboardCheck,
         Footprints, Wind, Timer, BedDouble, PlugZap } from 'lucide-react';
import MetricCard from './MetricCard';
import { useHealthData } from '../../store/HealthDataContext';
import { getTrendInfo, createSparklineData, hasValidData, formatSecondsToMMSS } from '../../utils/dataUtils';
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
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'average_hrv', 'hrv'),
                sparklineData: createSparklineData(ouraData, 'average_hrv'),
                icon: Activity,
                fullData: ouraData,
                dataKey: "average_hrv"
              },
              {
                title: "Resting Heart Rate",
                value: ouraData[0]?.resting_heart_rate?.toFixed(0) ?? '--',
                unit: "bpm",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'resting_heart_rate', 'rhr'),
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
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(withingsData, 'weight', 'weight'),
                sparklineData: createSparklineData(withingsData, 'weight'),
                icon: Scale,
                fullData: withingsData,
                dataKey: "weight"
              },
              {
                title: "Body Fat",
                value: withingsData[0]?.fat_ratio?.toFixed(1) ?? '--',
                unit: "%",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(withingsData, 'fat_ratio', 'bodyFat'),
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
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'total_sleep', 'sleep'),
                sparklineData: createSparklineData(ouraData, 'total_sleep'),
                icon: BedDouble,
                fullData: ouraData,
                dataKey: "total_sleep"
              },
              {
                title: "Deep Sleep",
                value: ouraData[0]?.deep_sleep_minutes?.toFixed(0) ?? '--',
                unit: "min",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'deep_sleep_minutes', 'deep_sleep'),
                sparklineData: createSparklineData(ouraData, 'deep_sleep_minutes'),
                icon: Waves,
                fullData: ouraData,
                dataKey: "deep_sleep_minutes"
              },
              {
                title: "Sleep Efficiency",
                value: ouraData[0]?.efficiency?.toFixed(0) ?? '--',
                unit: "%",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'efficiency', 'efficiency'),
                sparklineData: createSparklineData(ouraData, 'efficiency'),
                icon: PlugZap,
                fullData: ouraData,
                dataKey: "efficiency"
              },
              {
                title: "Sleep Delay",
                value: ouraData[0]?.delay?.toFixed(0) ?? '--',
                unit: "min",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(ouraData, 'delay', 'delay'),
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
                // *** CHANGE #2: Set unit to empty string ***
                unit: "",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(runningData.filter(d => !d.is_fill_value_vo2), 'vo2_max', 'vo2max'),
                sparklineData: createSparklineData(runningData, 'vo2_max'),
                icon: Wind,
                fullData: runningData,
                dataKey: "vo2_max"
              },
              {
                title: "5K Time",
                value: runningData[0]?.five_k_formatted ?? '--',
                unit: "",
                // *** CHANGE #1: Spread getTrendInfo results for all metrics ***
                ...getTrendInfo(runningData.filter(d => !d.is_fill_value_5k), 'five_k_seconds', 'five_k_seconds'),
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