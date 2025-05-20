// src/components/health/Dashboard.jsx
import React, { useEffect, useRef } from 'react';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand
} from 'lucide-react';
import { createSparklineData } from '../../utils/dataUtils';
import MetricSection from './MetricSection';
import HealthIntroCard from './HealthIntroCard';
import Card from '../Card';
// import useDarkMode from '../../hooks/useDarkMode'; // Not used in this snippet
import { useHealthData } from '../../store/HealthDataContext';
// import { hasValidData } from '../../utils/dataUtils'; // Not directly used for this component's logic anymore
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
  const {
    ouraSpark, oura,
    withings,
    runningSpark, running,
    clinicalSpark, clinical,
    otherData, otherDataSpark,
    isLoading, error,
  } = useHealthData();

  const heartSectionRef = useRef(null);
  const bodySectionRef = useRef(null);
  const sleepSectionRef = useRef(null);
  const fitnessSectionRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const section = hash.substring(1);
      const refs = {
        heart: heartSectionRef,
        body: bodySectionRef,
        sleep: sleepSectionRef,
        fitness: fitnessSectionRef,
      };
      const ref = refs[section];
      if (ref && ref.current) {
        setTimeout(() => {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingView />;
  }

  const allPrimaryDataEmpty = !(oura && oura.length > 0) &&
                             !(withings && withings.length > 0) &&
                             !(running && running.length > 0) &&
                             !(otherData && otherData.length > 0) &&
                             !(clinical && clinical.length > 0 && clinical[0]?.vo2_max_clinical);


  if (allPrimaryDataEmpty) {
    if (error) {
        return <ErrorView message={error} />;
    }
    return <ErrorView message="No relevant health data available to display. Please check your data sources." />;
  }
  
  const latestOtherData = otherData && otherData.length > 0 ? otherData[0] : {};
  const latestClinicalData = clinical && clinical.length > 0 ? clinical[0] : {};

  // Build fitness metrics array conditionally
  const fitnessMetrics = [];

  if (running && running.length > 0) {
    fitnessMetrics.push({
      title: "VO2 Max (Watch)",
      value: running[0]?.vo2_max?.toFixed(1) ?? '--',
      unit: "",
      ...getMetricCategoryInfo('vo2_max', running[0]?.vo2_max),
      sparklineData: createSparklineData(runningSpark, 'vo2_max'),
      icon: Watch,
      fullData: running,
      dataKey: "vo2_max"
    });
    fitnessMetrics.push({
      title: "5K Time",
      value: running[0]?.five_k_formatted ?? '--:--',
      unit: "",
      ...getMetricCategoryInfo('five_k_seconds', running[0]?.five_k_seconds),
      sparklineData: createSparklineData(runningSpark, 'five_k_seconds'),
      icon: Timer,
      fullData: running,
      dataKey: "five_k_seconds"
    });
  }

  if (clinical && clinical.length > 0 && latestClinicalData?.vo2_max_clinical) {
    fitnessMetrics.push({
      title: "VO2 Max (Clinical)",
      value: latestClinicalData?.vo2_max_clinical?.toFixed(1) ?? '--',
      unit: "",
      ...getMetricCategoryInfo('vo2_max_clinical', latestClinicalData?.vo2_max_clinical),
      sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'),
      icon: Microscope,
      fullData: clinical,
      dataKey: "vo2_max_clinical"
    });
  }

  if (otherData && otherData.length > 0) {
    fitnessMetrics.push({
      title: "Peak Flow",
      value: latestOtherData?.peak_flow?.toFixed(0) ?? '--',
      unit: "L/min",
      ...getMetricCategoryInfo('peak_flow', latestOtherData?.peak_flow),
      sparklineData: createSparklineData(otherDataSpark, 'peak_flow'),
      icon: Wind,
      fullData: otherData,
      dataKey: "peak_flow"
    });
    // SWAPPED ORDER HERE: Left Hand Grip first, then Right Hand Grip
    fitnessMetrics.push({
      title: "Left Hand Grip",
      value: latestOtherData?.weak_grip?.toFixed(1) ?? '--', // Assuming 'weak_grip' is the key for left hand
      unit: "kg",
      ...getMetricCategoryInfo('weak_grip', latestOtherData?.weak_grip),
      sparklineData: createSparklineData(otherDataSpark, 'weak_grip'),
      icon: Hand,
      fullData: otherData,
      dataKey: "weak_grip"
    });
    fitnessMetrics.push({
      title: "Right Hand Grip",
      value: latestOtherData?.strong_grip?.toFixed(1) ?? '--',
      unit: "kg",
      ...getMetricCategoryInfo('strong_grip', latestOtherData?.strong_grip),
      sparklineData: createSparklineData(otherDataSpark, 'strong_grip'),
      icon: Hand,
      fullData: otherData,
      dataKey: "strong_grip"
    });
  }
  
  const showFitnessSection = fitnessMetrics.length > 0;

  return (
    <div className="pt-2 pb-8">
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
                  ...getMetricCategoryInfo('weight', withings[0]?.weight),
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
                  icon: BedDouble,
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

        {/* Fitness Section - Updated Logic */}
        {showFitnessSection && (
          <section id="fitness" ref={fitnessSectionRef}>
            <MetricSection
              title="Fitness"
              icon={Footprints}
              metrics={fitnessMetrics.filter(metric => metric && Object.keys(metric).length > 0)}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;