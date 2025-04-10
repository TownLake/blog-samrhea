// src/components/health/Dashboard.jsx
import React, { useEffect, useRef } from 'react';
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
  const [isDarkMode] = useDarkMode();
  const {
    ouraData,
    withingsData,
    runningData,
    isLoading,
    error,
  } = useHealthData();

  // References for scroll targets
  const heartSectionRef = useRef(null);
  const bodySectionRef = useRef(null);
  const sleepSectionRef = useRef(null);
  const runningSectionRef = useRef(null);

  // Handle hash-based navigation
  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # character
      const section = hash.substring(1);
      
      // Map section names to refs
      const sectionRefs = {
        heart: heartSectionRef,
        body: bodySectionRef,
        sleep: sleepSectionRef,
        running: runningSectionRef
      };
      
      // Scroll to the section if it exists
      const targetRef = sectionRefs[section];
      if (targetRef && targetRef.current) {
        // Add a small delay to ensure the DOM is fully rendered
        setTimeout(() => {
          targetRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [isLoading]); // Re-run when loading state changes

  if (isLoading) {
    return <LoadingView />;
  }

  if (!hasValidData(ouraData, withingsData) && !runningData?.length > 0) {
    return <ErrorView message={error || 'No health data available'} />;
  }

  return (
    <div className="pt-2 pb-8">
      {error && !isLoading && <ErrorView message={error} />}

      <HealthIntroCard />

      <div className="space-y-10">
        {/* Heart Section */}
        {(ouraData && ouraData.length > 0) && (
          <section id="heart" ref={heartSectionRef}>
            <MetricSection
              title="Heart"
              icon={Heart}
              metrics={[
                {
                  title: "HRV",
                  value: ouraData[0]?.average_hrv?.toFixed(0) ?? '--',
                  unit: "ms",
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
                  ...getMetricCategoryInfo('resting_heart_rate', ouraData[0]?.resting_heart_rate),
                  sparklineData: createSparklineData(ouraData, 'resting_heart_rate'),
                  icon: HeartPulse,
                  fullData: ouraData,
                  dataKey: "resting_heart_rate"
                }
              ]}
            />
          </section>
        )}

        {/* Body Section */}
        {(withingsData && withingsData.length > 0) && (
          <section id="body" ref={bodySectionRef}>
            <MetricSection
              title="Body"
              icon={ClipboardCheck}
              metrics={[
                {
                  title: "Weight",
                  value: withingsData[0]?.weight?.toFixed(1) ?? '--',
                  unit: "lbs",
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
                  ...getMetricCategoryInfo('fat_ratio', withingsData[0]?.fat_ratio),
                  sparklineData: createSparklineData(withingsData, 'fat_ratio'),
                  icon: Ruler,
                  fullData: withingsData,
                  dataKey: "fat_ratio"
                }
              ]}
            />
          </section>
        )}

        {/* Sleep Section */}
        {(ouraData && ouraData.length > 0) && (
          <section id="sleep" ref={sleepSectionRef}>
            <MetricSection
              title="Sleep"
              icon={BedDouble}
              metrics={[
                {
                  title: "Total Sleep",
                  value: ouraData[0]?.total_sleep?.toFixed(1) ?? '--',
                  unit: "h",
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
                  ...getMetricCategoryInfo('delay', ouraData[0]?.delay),
                  sparklineData: createSparklineData(ouraData, 'delay'),
                  icon: Hourglass,
                  fullData: ouraData,
                  dataKey: "delay"
                }
              ]}
            />
          </section>
        )}

        {/* Running Section */}
        {(runningData && runningData.length > 0) && (
          <section id="running" ref={runningSectionRef}>
            <MetricSection
              title="Running"
              icon={Footprints}
              metrics={[
                {
                  title: "VO2 Max",
                  value: runningData[0]?.vo2_max?.toFixed(1) ?? '--',
                  unit: "",
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
                  textColorClass: "text-gray-500 dark:text-gray-400",
                  hexColor: "#a1a1aa",
                  category: "default",
                  label: "No Category",
                  sparklineData: createSparklineData(runningData, 'five_k_seconds'),
                  icon: Timer,
                  fullData: runningData,
                  dataKey: "five_k_seconds"
                }
              ]}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
