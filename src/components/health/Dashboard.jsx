// src/components/health/Dashboard.jsx
import React, { useEffect, useRef } from 'react';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand // Added Wind, Hand
} from 'lucide-react';
import { createSparklineData } from '../../utils/dataUtils';
import MetricSection from './MetricSection';
import HealthIntroCard from './HealthIntroCard';
import Card from '../Card';
// import useDarkMode from '../../hooks/useDarkMode'; // useDarkMode is not used in this component snippet
import { useHealthData } from '../../store/HealthDataContext';
import { hasValidData } from '../../utils/dataUtils'; // hasValidData might need to be updated if 'otherData' is a primary source
import { getMetricCategoryInfo } from '../../utils/healthCategories';

const LoadingView = () => (
  <div className="py-20 text-center text-gray-500 dark:text-gray-400">
    <p>Loading health data...</p>
  </div>
);

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
  // const [isDarkMode] = useDarkMode(); // isDarkMode not used
  const {
    ouraSpark, oura,
    withings, // Assuming withings data is available for hasValidData check
    runningSpark, running,
    clinicalSpark, clinical,
    otherData, otherDataSpark, // Get new data from context
    isLoading, error,
  } = useHealthData();

  const heartSectionRef = useRef(null);
  const bodySectionRef = useRef(null);
  const sleepSectionRef = useRef(null);
  const fitnessSectionRef = useRef(null); // Already exists

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const section = hash.substring(1);
      const refs = {
        heart: heartSectionRef,
        body: bodySectionRef,
        sleep: sleepSectionRef,
        fitness: fitnessSectionRef, // Corrected from 'running' to 'fitness' to match ID
      };
      const ref = refs[section];
      if (ref && ref.current) {
        setTimeout(() => {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // Delay to ensure content is rendered
      }
    }
  }, [isLoading]); // Rerun on isLoading change

  if (isLoading) {
    return <LoadingView />;
  }

  // Update hasValidData if 'otherData' should also be considered for initial dashboard display
  // For now, keeps original logic:
  if (!hasValidData(oura, withings) && !(running && running.length > 0) && !(otherData && otherData.length > 0)) {
     // If all primary data sources are empty, show error or a "no data" state
    if (error) {
        return <ErrorView message={error} />;
    }
    // You might want a specific "No data available" view if error is null but data is empty
    return <ErrorView message="No health data available to display. Please check your data sources." />;
  }
  
  // Check if 'otherData' exists and has entries before trying to access otherData[0]
  const latestOtherData = otherData && otherData.length > 0 ? otherData[0] : {};

  return (
    <div className="pt-2 pb-8">
      {/* Display error prominently if it exists, even if some data might be loaded partially */}
      {error && !isLoading && <ErrorView message={error} />}

      <HealthIntroCard />

      <div className="space-y-10">
        {/* Heart Section - unchanged */}
        {oura && oura.length > 0 && (
          <section id="heart" ref={heartSectionRef}>
            <MetricSection
              title="Heart"
              icon={Heart}
              metrics={[
                {
                  title: "HRV",
                  value: oura[0]?.average_hrv?.toFixed(0) ?? '--',
                  unit: "ms",
                  ...getMetricCategoryInfo('average_hrv', oura[0]?.average_hrv),
                  sparklineData: createSparklineData(ouraSpark, 'average_hrv'),
                  icon: Activity,
                  fullData: oura,
                  dataKey: "average_hrv"
                },
                {
                  title: "Resting Heart Rate",
                  value: oura[0]?.resting_heart_rate?.toFixed(0) ?? '--',
                  unit: "bpm",
                  ...getMetricCategoryInfo('resting_heart_rate', oura[0]?.resting_heart_rate),
                  sparklineData: createSparklineData(ouraSpark, 'resting_heart_rate'),
                  icon: HeartPulse,
                  fullData: oura,
                  dataKey: "resting_heart_rate"
                }
              ]}
            />
          </section>
        )}

        {/* Body Section - unchanged */}
        {withings && withings.length > 0 && (
          <section id="body" ref={bodySectionRef}>
            <MetricSection
              title="Body"
              icon={ClipboardCheck}
              metrics={[
                {
                  title: "Weight",
                  value: withings[0]?.weight?.toFixed(1) ?? '--',
                  unit: "lbs",
                  // Explicitly default for Weight as it has no categories defined
                  ...getMetricCategoryInfo('weight', withings[0]?.weight), // Will return 'default'
                  sparklineData: createSparklineData(withings, 'weight'),
                  icon: Scale,
                  fullData: withings,
                  dataKey: "weight"
                },
                {
                  title: "Body Fat",
                  value: withings[0]?.fat_ratio?.toFixed(1) ?? '--',
                  unit: "%",
                  ...getMetricCategoryInfo('fat_ratio', withings[0]?.fat_ratio),
                  sparklineData: createSparklineData(withings, 'fat_ratio'),
                  icon: Ruler,
                  fullData: withings,
                  dataKey: "fat_ratio"
                }
              ]}
            />
          </section>
        )}

        {/* Sleep Section - unchanged */}
        {oura && oura.length > 0 && (
          <section id="sleep" ref={sleepSectionRef}>
            <MetricSection
              title="Sleep"
              icon={BedDouble}
              metrics={[
                {
                  title: "Total Sleep",
                  value: oura[0]?.total_sleep?.toFixed(1) ?? '--',
                  unit: "h",
                  ...getMetricCategoryInfo('total_sleep', oura[0]?.total_sleep),
                  sparklineData: createSparklineData(ouraSpark, 'total_sleep'),
                  icon: BedDouble, // Can reuse or pick a more specific one
                  fullData: oura,
                  dataKey: "total_sleep"
                },
                {
                  title: "Deep Sleep",
                  value: oura[0]?.deep_sleep_minutes?.toFixed(0) ?? '--',
                  unit: "min",
                  ...getMetricCategoryInfo('deep_sleep_minutes', oura[0]?.deep_sleep_minutes),
                  sparklineData: createSparklineData(ouraSpark, 'deep_sleep_minutes'),
                  icon: Waves,
                  fullData: oura,
                  dataKey: "deep_sleep_minutes"
                },
                {
                  title: "Sleep Efficiency",
                  value: oura[0]?.efficiency?.toFixed(0) ?? '--',
                  unit: "%",
                  ...getMetricCategoryInfo('efficiency', oura[0]?.efficiency),
                  sparklineData: createSparklineData(ouraSpark, 'efficiency'),
                  icon: PlugZap,
                  fullData: oura,
                  dataKey: "efficiency"
                },
                {
                  title: "Sleep Delay",
                  value: oura[0]?.delay?.toFixed(0) ?? '--',
                  unit: "min",
                  ...getMetricCategoryInfo('delay', oura[0]?.delay),
                  sparklineData: createSparklineData(ouraSpark, 'delay'),
                  icon: Hourglass,
                  fullData: oura,
                  dataKey: "delay"
                }
              ]}
            />
          </section>
        )}

        {/* Fitness Section - ADD NEW METRICS HERE */}
        {/* Ensure fitness section shows if either running OR otherData is available */}
        {(running && running.length > 0 || otherData && otherData.length > 0) && (
          <section id="fitness" ref={fitnessSectionRef}>
            <MetricSection
              title="Fitness"
              icon={Footprints} // Main icon for fitness
              metrics={[
                // Existing Fitness Metrics (if running data is available)
                ...(running && running.length > 0 ? [
                  {
                    title: "VO2 Max (Watch)",
                    value: running[0]?.vo2_max?.toFixed(1) ?? '--',
                    unit: "", // Unit is often part of the title or implied
                    ...getMetricCategoryInfo('vo2_max', running[0]?.vo2_max),
                    sparklineData: createSparklineData(runningSpark, 'vo2_max'),
                    icon: Watch,
                    fullData: running,
                    dataKey: "vo2_max"
                  },
                  { // Only show clinical VO2 if clinical data exists
                    ...(clinical && clinical.length > 0 && clinical[0]?.vo2_max_clinical ? [{
                        title: "VO2 Max (Clinical)",
                        value: clinical[0]?.vo2_max_clinical?.toFixed(1) ?? '--',
                        unit: "",
                        ...getMetricCategoryInfo('vo2_max_clinical', clinical[0]?.vo2_max_clinical), // use 'vo2_max_clinical' if ranges differ
                        sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'),
                        icon: Microscope,
                        fullData: clinical,
                        dataKey: "vo2_max_clinical"
                    }] : [])
                  },
                  {
                    title: "5K Time",
                    value: running[0]?.five_k_formatted ?? '--:--',
                    unit: "", // Unit is in formatted time
                    ...getMetricCategoryInfo('five_k_seconds', running[0]?.five_k_seconds), // No category for 5K
                    sparklineData: createSparklineData(runningSpark, 'five_k_seconds'),
                    icon: Timer,
                    fullData: running,
                    dataKey: "five_k_seconds"
                  }
                ] : []),
                
                // New Fitness Metrics (if otherData is available)
                ...(otherData && otherData.length > 0 ? [
                  {
                    title: "Peak Flow",
                    value: latestOtherData?.peak_flow?.toFixed(0) ?? '--', // Or toFixed(1) if needed
                    unit: "L/min",
                    ...getMetricCategoryInfo('peak_flow', latestOtherData?.peak_flow),
                    sparklineData: createSparklineData(otherDataSpark, 'peak_flow'),
                    icon: Wind, // Lucide icon for wind/air flow
                    fullData: otherData,
                    dataKey: "peak_flow"
                  },
                  {
                    title: "Right Hand Grip",
                    value: latestOtherData?.strong_grip?.toFixed(1) ?? '--',
                    unit: "kg",
                    ...getMetricCategoryInfo('strong_grip', latestOtherData?.strong_grip),
                    sparklineData: createSparklineData(otherDataSpark, 'strong_grip'),
                    icon: Hand, // Lucide icon (generic Hand, or find a specific Grip icon)
                    fullData: otherData,
                    dataKey: "strong_grip"
                  },
                  {
                    title: "Left Hand Grip",
                    value: latestOtherData?.weak_grip?.toFixed(1) ?? '--', // Assuming 'weak_grip' is the key for left hand
                    unit: "kg",
                    ...getMetricCategoryInfo('weak_grip', latestOtherData?.weak_grip),
                    sparklineData: createSparklineData(otherDataSpark, 'weak_grip'),
                    icon: Hand, // Can use the same icon, or a mirrored one if available
                    fullData: otherData,
                    dataKey: "weak_grip"
                  }
                ] : [])
              ].filter(metric => metric && Object.keys(metric).length > 0) // Filter out any potentially empty objects from conditional spreading
            }
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;