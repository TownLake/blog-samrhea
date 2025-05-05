// src/components/health/Dashboard.jsx
import React, { useEffect, useRef } from 'react';
import {
  Heart,
  Scale,
  ClipboardCheck,
  BedDouble,
  Footprints,
  Activity,
  HeartPulse,
  Ruler,
  Waves,
  PlugZap,
  Hourglass,
  Wind,
  Timer,
  Watch,
  Microscope
} from 'lucide-react';
import { createSparklineData } from '../../utils/dataUtils';
import MetricSection from './MetricSection';
import HealthIntroCard from './HealthIntroCard';
import Card from '../Card';
import useDarkMode from '../../hooks/useDarkMode';
import { useHealthData } from '../../store/HealthDataContext';
import { hasValidData } from '../../utils/dataUtils';
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
  const [isDarkMode] = useDarkMode();
  const {
    ouraSpark,
    oura,
    withings,
    runningSpark,
    running,
    clinicalSpark,
    clinical,
    isLoading,
    error,
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
        running: fitnessSectionRef,
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

  if (!hasValidData(oura, withings) && !(running && running.length > 0)) {
    return <ErrorView message={error} />;
  }
  return (
    <div className="pt-2 pb-8">
      {error && !isLoading && <ErrorView message={error} />}

      <HealthIntroCard />

      <div className="space-y-10">
        {oura.length > 0 && (
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

        {withings.length > 0 && (
          <section id="body" ref={bodySectionRef}>
            <MetricSection
              title="Body"
              icon={ClipboardCheck}
              metrics={[
                {
                  title: "Weight",
                  value: withings[0]?.weight?.toFixed(1) ?? '--',
                  unit: "lbs",
                  textColorClass: "text-gray-500 dark:text-gray-400",
                  hexColor: "#a1a1aa",
                  category: "default",
                  label: "No Category",
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
{oura.length > 0 && (
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
{running.length > 0 && (
          <section id="fitness" ref={fitnessSectionRef}>
            <MetricSection
              title="Fitness"
              icon={Footprints}
              metrics={[
                {
                  title: "VO2 Max (Watch)",
                  value: running[0]?.vo2_max?.toFixed(1) ?? '--',
                  unit: "",
                  ...getMetricCategoryInfo('vo2_max', running[0]?.vo2_max),
                  sparklineData: createSparklineData(runningSpark, 'vo2_max'),
                  icon: Watch,
                  fullData: running,
                  dataKey: "vo2_max"
                },
                {
                  title: "VO2 Max (Clinical)",
                  value: clinical[0]?.vo2_max_clinical?.toFixed(1) ?? '--',
                  unit: "",
                  ...getMetricCategoryInfo('vo2_max', clinical[0]?.vo2_max_clinical),
                  sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'),
                  icon: Microscope,
                  fullData: clinical,
                  dataKey: "vo2_max_clinical"
                },
                {
                  title: "5K Time",
                  value: running[0]?.five_k_formatted ?? '--',
                  unit: "",
                  textColorClass: "text-gray-500 dark:text-gray-400",
                  hexColor: "#a1a1aa",
                  category: "default",
                  label: "No Category",
                  sparklineData: createSparklineData(runningSpark, 'five_k_seconds'),
                  icon: Timer,
                  fullData: running,
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