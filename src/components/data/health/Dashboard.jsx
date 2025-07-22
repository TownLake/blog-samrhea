// src/components/data/health/HealthDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand, BarChart2,
  Flame, Beef, Wheat, Donut, Link2, Nut
} from 'lucide-react';
import { createSparklineData } from '../../../utils/dataUtils';
import MetricSection from './MetricSection';
import MetricCard from './MetricCard';
import DataIntroCard from '../DataIntroCard';
import Card from '../../Card';
import { useHealthData } from '../../../store/HealthDataContext';
import { getMetricCategoryInfo } from '../../../utils/healthCategories';

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

const PairedMetricContainer = ({ children }) => (
  <div className="grid grid-cols-2 gap-4">
    {children}
  </div>
);

const HealthDashboard = () => {
  const {
    oura, ouraSpark,
    withings,
    running, runningSpark,
    clinical, clinicalSpark,
    otherData, otherDataSpark,
    macros, macrosSpark,
    isLoading, error,
  } = useHealthData();

  const location = useLocation();
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) {
      setActiveModal(null);
      return;
    }
    const element = document.getElementById(hash);
    if (element && !isLoading) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      setActiveModal(null);
    } else if (!isLoading) {
      setActiveModal(hash);
    }
  }, [location.hash, isLoading]);

  const handleOpenModal = (dataKey) => {
    setActiveModal(dataKey);
    window.location.hash = dataKey;
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    const { pathname, search } = window.location;
    window.history.pushState("", document.title, pathname + search);
  };
  
  if (isLoading) {
    return <LoadingView />;
  }

  const hasData = (arr) => arr && arr.length > 0;
  
  const allDataSourcesEmpty = [oura, withings, running, otherData, macros].every(source => !hasData(source));
  if (allDataSourcesEmpty) {
    return <ErrorView message={error || "No relevant health data available to display."} />;
  }
  
  const createMetric = ({
    data, dataSpark, dataKey,
    title, unit, icon,
    formatter = (v) => v != null ? Math.round(v).toLocaleString() : '--',
    categoryKey = dataKey
  }) => {
    const latestRecord = (data || []).find(d => d[dataKey] != null) || {};
    const rawValue = latestRecord[dataKey];
    
    return {
      title,
      value: formatter(rawValue, latestRecord),
      unit,
      ...getMetricCategoryInfo(categoryKey, rawValue),
      sparklineData: createSparklineData(dataSpark || data, dataKey),
      icon,
      fullData: data,
      dataKey,
    };
  };
  
  const metrics = useMemo(() => ({
    hrv: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'average_hrv', title: "HRV", unit: "ms", icon: Activity }),
    rhr: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'resting_heart_rate', title: "RHR", unit: "bpm", icon: HeartPulse }),
    weight: createMetric({ data: withings, dataSpark: withings, dataKey: 'weight', title: "Weight", unit: "lbs", icon: Scale, formatter: v => v?.toFixed(1) ?? '--' }),
    bodyFat: createMetric({ data: withings, dataSpark: withings, dataKey: 'fat_ratio', title: "Body Fat", unit: "%", icon: Ruler, formatter: v => v?.toFixed(1) ?? '--' }),
    totalSleep: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'total_sleep', title: "Total Sleep", unit: "h", icon: BedDouble, formatter: v => v?.toFixed(1) ?? '--' }),
    deepSleep: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'deep_sleep_minutes', title: "Deep Sleep", unit: "min", icon: Waves }),
    sleepEfficiency: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'efficiency', title: "Sleep Efficiency", unit: "%", icon: PlugZap }),
    sleepDelay: createMetric({ data: oura, dataSpark: ouraSpark, dataKey: 'delay', title: "Sleep Delay", unit: "min", icon: Hourglass }),
    vo2MaxWatch: createMetric({ data: running, dataSpark: runningSpark, dataKey: 'vo2_max', title: "VO2 Max (Watch)", unit: "", icon: Watch, formatter: v => v?.toFixed(1) ?? '--' }),
    vo2MaxClinical: createMetric({ data: clinical, dataSpark: clinicalSpark, dataKey: 'vo2_max_clinical', title: "VO2 Max (Clinical)", unit: "", icon: Microscope, formatter: v => v?.toFixed(1) ?? '--' }),
    powerBreathe: createMetric({ data: otherData, dataSpark: otherDataSpark, dataKey: 'power_breathe_level', title: "Power Breathe", unit: "Level", icon: Timer, formatter: v => v?.toFixed(1) ?? '--' }),
    peakFlow: createMetric({ data: otherData, dataSpark: otherDataSpark, dataKey: 'peak_flow', title: "Peak Flow", unit: "L/min", icon: Wind }),
    leftGrip: createMetric({ data: otherData, dataSpark: otherDataSpark, dataKey: 'weak_grip', title: "Left Hand Grip", unit: "kg", icon: Hand, formatter: v => v?.toFixed(1) ?? '--' }),
    rightGrip: createMetric({ data: otherData, dataSpark: otherDataSpark, dataKey: 'strong_grip', title: "Right Hand Grip", unit: "kg", icon: Hand, formatter: v => v?.toFixed(1) ?? '--' }),
    fiveK: createMetric({ data: running, dataSpark: runningSpark, dataKey: 'five_k_seconds', title: "5K Time", unit: "", icon: Timer, formatter: (v, rec) => rec?.five_k_formatted ?? '--:--' }),
    tenK: createMetric({ data: [], dataSpark: [], dataKey: 'ten_k_seconds', title: "10K Time", unit: "", icon: Timer, formatter: () => '--:--' }),
    calories: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'calories_kcal', title: "Calories", unit: "kcal", icon: Flame }),
    protein: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'protein_g', title: "Protein", unit: "g", icon: Beef }),
    carbs: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'carbs_g', title: "Carbs", unit: "g", icon: Wheat }),
    fat: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'fat_g', title: "Fat", unit: "g", icon: Nut }),
    satFat: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'sat_fat_g', title: "Saturated Fat", unit: "g", icon: Link2 }),
    sugar: createMetric({ data: macros, dataSpark: macrosSpark, dataKey: 'sugar_g', title: "Sugar", unit: "g", icon: Donut }),
  }), [oura, ouraSpark, withings, running, runningSpark, clinical, clinicalSpark, otherData, otherDataSpark, macros, macrosSpark]);

  const createMetricProps = (metric, displayMode = 'full') => ({
    ...metric,
    displayMode,
    isOpen: activeModal === metric.dataKey,
    onOpen: () => handleOpenModal(metric.dataKey),
    onClose: handleCloseModal,
  });
  
  const dashboardSections = [
    {
      title: 'Heart', icon: Heart, hasData: hasData(oura),
      items: [ { type: 'pair', metrics: [metrics.hrv, metrics.rhr] } ]
    },
    {
      title: 'Body', icon: ClipboardCheck, hasData: hasData(withings),
      items: [ { type: 'pair', metrics: [metrics.weight, metrics.bodyFat] } ]
    },
    {
      title: 'Sleep', icon: BedDouble, hasData: hasData(oura),
      items: [
        { type: 'full', metric: metrics.totalSleep },
        { type: 'full', metric: metrics.deepSleep },
        { type: 'pair', metrics: [metrics.sleepEfficiency, metrics.sleepDelay] }
      ]
    },
    {
      title: 'Fitness', icon: Footprints, hasData: [running, clinical, otherData].some(hasData),
      items: [
        { type: 'pair', metrics: [metrics.vo2MaxWatch, metrics.vo2MaxClinical], condition: hasData(running) && hasData(clinical) },
        { type: 'pair', metrics: [metrics.powerBreathe, metrics.peakFlow], condition: hasData(otherData) },
        { type: 'pair', metrics: [metrics.leftGrip, metrics.rightGrip], condition: hasData(otherData) },
        { type: 'pair', metrics: [metrics.fiveK, metrics.tenK], condition: hasData(running) },
      ]
    },
    {
      title: 'Macros', icon: BarChart2, hasData: hasData(macros),
      items: [
        { type: 'full', metric: metrics.calories },
        { type: 'full', metric: metrics.protein },
        { type: 'pair', metrics: [metrics.fat, metrics.satFat] },
        { type: 'pair', metrics: [metrics.carbs, metrics.sugar] }
      ]
    }
  ];

  return (
    <div className="pt-2 pb-8">
      <DataIntroCard title="Health Data" icon={BarChart2}>
        <p>I publish these to have a home page for myself. I think <a href="https://blog.samrhea.com/post/2024-01-30-health-data" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">a lot</a> about this kind of data. And, if you're like me, you could use this <a href="https://github.com/TownLake/core-health" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">open-sourced dashboard</a> I built, too.</p>
      </DataIntroCard>

      <div className="space-y-12 mt-8">
        {dashboardSections.map(section => (
          section.hasData && (
            <MetricSection key={section.title} title={section.title} icon={section.icon}>
              {section.items
                .filter(item => item.condition !== false)
                .map((item, index) => {
                  if (item.type === 'full') {
                    return <MetricCard key={item.metric.dataKey} {...createMetricProps(item.metric, 'full')} />;
                  }
                  
                  if (item.type === 'pair') {
                    return (
                      <PairedMetricContainer key={index}>
                        <MetricCard {...createMetricProps(item.metrics[0], 'compact')} />
                        <MetricCard {...createMetricProps(item.metrics[1], 'compact')} />
                      </PairedMetricContainer>
                    );
                  }
                  return null;
              })}
            </MetricSection>
          )
        ))}
      </div>
    </div>
  );
};

export default HealthDashboard;