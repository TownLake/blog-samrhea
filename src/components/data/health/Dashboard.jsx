// src/components/data/health/HealthDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand, BarChart2,
  Flame, Beef, Wheat, Droplets, Donut, Unplug
} from 'lucide-react';
import { createSparklineData } from '../../../utils/dataUtils';
import MetricSection from './MetricSection';
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
    window.location.hash = dataKey;
  };

  const handleCloseModal = () => {
    const { pathname, search } = window.location;
    window.history.pushState("", document.title, pathname + search);
    setActiveModal(null);
  };

  if (isLoading) {
    return <LoadingView />;
  }
  
  const hasData = (arr) => arr && arr.length > 0;

  if (!hasData(oura) && !hasData(withings) && !hasData(running) && !hasData(otherData) && !hasData(macros)) {
    return <ErrorView message={error || "No relevant health data available to display."} />;
  }

  const createMetricProps = (metric) => ({
    ...metric,
    isOpen: activeModal === metric.dataKey,
    onOpen: () => handleOpenModal(metric.dataKey),
    onClose: handleCloseModal,
  });
  
  // --- Define Metric Arrays ---
  const latestOura = hasData(oura) ? oura[0] : {};
  const heartMetrics = hasData(oura) ? [
    { title: "HRV", value: latestOura.average_hrv?.toFixed(0) ?? '--', unit: "ms", ...getMetricCategoryInfo('average_hrv', latestOura.average_hrv), sparklineData: createSparklineData(ouraSpark, 'average_hrv'), icon: Activity, fullData: oura, dataKey: "average_hrv" },
    { title: "Resting Heart Rate", value: latestOura.resting_heart_rate?.toFixed(0) ?? '--', unit: "bpm", ...getMetricCategoryInfo('resting_heart_rate', latestOura.resting_heart_rate), sparklineData: createSparklineData(ouraSpark, 'resting_heart_rate'), icon: HeartPulse, fullData: oura, dataKey: "resting_heart_rate" }
  ] : [];

  const latestWithings = hasData(withings) ? withings[0] : {};
  const bodyMetrics = hasData(withings) ? [
    { title: "Weight", value: latestWithings.weight?.toFixed(1) ?? '--', unit: "lbs", ...getMetricCategoryInfo('weight', latestWithings.weight), sparklineData: createSparklineData(withings, 'weight'), icon: Scale, fullData: withings, dataKey: "weight" },
    { title: "Body Fat", value: latestWithings.fat_ratio?.toFixed(1) ?? '--', unit: "%", ...getMetricCategoryInfo('fat_ratio', latestWithings.fat_ratio), sparklineData: createSparklineData(withings, 'fat_ratio'), icon: Ruler, fullData: withings, dataKey: "fat_ratio" }
  ] : [];

  const sleepMetrics = hasData(oura) ? [
    { title: "Total Sleep", value: latestOura.total_sleep?.toFixed(1) ?? '--', unit: "h", ...getMetricCategoryInfo('total_sleep', latestOura.total_sleep), sparklineData: createSparklineData(ouraSpark, 'total_sleep'), icon: BedDouble, fullData: oura, dataKey: "total_sleep" },
    { title: "Deep Sleep", value: latestOura.deep_sleep_minutes?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('deep_sleep_minutes', latestOura.deep_sleep_minutes), sparklineData: createSparklineData(ouraSpark, 'deep_sleep_minutes'), icon: Waves, fullData: oura, dataKey: "deep_sleep_minutes" },
    { title: "Sleep Efficiency", value: latestOura.efficiency?.toFixed(0) ?? '--', unit: "%", ...getMetricCategoryInfo('efficiency', latestOura.efficiency), sparklineData: createSparklineData(ouraSpark, 'efficiency'), icon: PlugZap, fullData: oura, dataKey: "efficiency" },
    { title: "Sleep Delay", value: latestOura.delay?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('delay', latestOura.delay), sparklineData: createSparklineData(ouraSpark, 'delay'), icon: Hourglass, fullData: oura, dataKey: "delay" }
  ] : [];
  
  const latestOtherData = hasData(otherData) ? otherData[0] : {};
  const latestClinicalData = hasData(clinical) ? clinical[0] : {};
  const latestRunning = hasData(running) ? running[0] : {};
  const fitnessMetrics = [];
  if (hasData(running)) fitnessMetrics.push({ title: "VO2 Max (Watch)", value: latestRunning.vo2_max?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max', latestRunning.vo2_max), sparklineData: createSparklineData(runningSpark, 'vo2_max'), icon: Watch, fullData: running, dataKey: "vo2_max" });
  if (hasData(clinical) && latestClinicalData?.vo2_max_clinical) fitnessMetrics.push({ title: "VO2 Max (Clinical)", value: latestClinicalData.vo2_max_clinical?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max_clinical', latestClinicalData.vo2_max_clinical), sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'), icon: Microscope, fullData: clinical, dataKey: "vo2_max_clinical" });
  if (hasData(otherData)) fitnessMetrics.push({ title: "Power Breathe", value: latestOtherData.power_breathe_level?.toFixed(1) ?? '--', unit: "Level", ...getMetricCategoryInfo('power_breathe_level', latestOtherData.power_breathe_level), sparklineData: createSparklineData(otherDataSpark, 'power_breathe_level'), icon: Timer, fullData: otherData, dataKey: "power_breathe_level" }, { title: "Peak Flow", value: latestOtherData.peak_flow?.toFixed(0) ?? '--', unit: "L/min", ...getMetricCategoryInfo('peak_flow', latestOtherData.peak_flow), sparklineData: createSparklineData(otherDataSpark, 'peak_flow'), icon: Wind, fullData: otherData, dataKey: "peak_flow" });
  if (hasData(otherData)) fitnessMetrics.push({ title: "Left Hand Grip", value: latestOtherData.weak_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('weak_grip', latestOtherData.weak_grip), sparklineData: createSparklineData(otherDataSpark, 'weak_grip'), icon: Hand, fullData: otherData, dataKey: "weak_grip" }, { title: "Right Hand Grip", value: latestOtherData.strong_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('strong_grip', latestOtherData.strong_grip), sparklineData: createSparklineData(otherDataSpark, 'strong_grip'), icon: Hand, fullData: otherData, dataKey: "strong_grip" });
  if (hasData(running)) fitnessMetrics.push({ title: "5K Time", value: latestRunning.five_k_formatted ?? '--:--', unit: "", ...getMetricCategoryInfo('five_k_seconds', latestRunning.five_k_seconds), sparklineData: createSparklineData(runningSpark, 'five_k_seconds'), icon: Timer, fullData: running, dataKey: "five_k_seconds" }, { title: "10K Time", value: '--:--', unit: "", ...getMetricCategoryInfo('ten_k_seconds', null), sparklineData: [], icon: Timer, fullData: [], dataKey: "ten_k_seconds" });

  const latestMacros = hasData(macros) ? macros[0] : {};
  const macroMetrics = hasData(macros) ? [
    { title: "Calories", value: latestMacros.calories_kcal?.toLocaleString() ?? '--', unit: "kcal", ...getMetricCategoryInfo('calories_kcal', latestMacros.calories_kcal), sparklineData: createSparklineData(macrosSpark, 'calories_kcal'), icon: Flame, fullData: macros, dataKey: "calories_kcal" },
    { title: "Protein", value: latestMacros.protein_g?.toFixed(1) ?? '--', unit: "g", ...getMetricCategoryInfo('protein_g', latestMacros.protein_g), sparklineData: createSparklineData(macrosSpark, 'protein_g'), icon: Beef, fullData: macros, dataKey: "protein_g" },
    { title: "Carbs", value: latestMacros.carbs_g?.toFixed(1) ?? '--', unit: "g", ...getMetricCategoryInfo('carbs_g', latestMacros.carbs_g), sparklineData: createSparklineData(macrosSpark, 'carbs_g'), icon: Wheat, fullData: macros, dataKey: "carbs_g" },
    { title: "Fat", value: latestMacros.fat_g?.toFixed(1) ?? '--', unit: "g", ...getMetricCategoryInfo('fat_g', latestMacros.fat_g), sparklineData: createSparklineData(macrosSpark, 'fat_g'), icon: Droplets, fullData: macros, dataKey: "fat_g" },
    { title: "Saturated Fat", value: latestMacros.sat_fat_g?.toFixed(1) ?? '--', unit: "g", ...getMetricCategoryInfo('sat_fat_g', latestMacros.sat_fat_g), sparklineData: createSparklineData(macrosSpark, 'sat_fat_g'), icon: Unplug, fullData: macros, dataKey: "sat_fat_g" },
    { title: "Sugar", value: latestMacros.sugar_g?.toFixed(1) ?? '--', unit: "g", ...getMetricCategoryInfo('sugar_g', latestMacros.sugar_g), sparklineData: createSparklineData(macrosSpark, 'sugar_g'), icon: Donut, fullData: macros, dataKey: "sugar_g" }
  ] : [];

  return (
    <div className="pt-2 pb-8">
      <DataIntroCard title="Health Data" icon={BarChart2}>
        <p>
          I publish these to have a home page for myself. I think{' '} 
          <a href="https://blog.samrhea.com/post/2024-01-30-health-data" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            a lot
          </a> about this kind of data. And, if you're like me, you could use this{' '} 
          <a href="https://github.com/TownLake/core-health" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            open-sourced dashboard
          </a> I built, too.
        </p>
      </DataIntroCard>

      {/* --- MODIFIED: Reordered sections --- */}
      <div className="space-y-12 mt-8">
        {heartMetrics.length > 0 && (
          <MetricSection title="Heart" icon={Heart} metrics={heartMetrics.map(createMetricProps)} />
        )}
        {bodyMetrics.length > 0 && (
          <MetricSection title="Body" icon={ClipboardCheck} metrics={bodyMetrics.map(createMetricProps)} />
        )}
        {sleepMetrics.length > 0 && (
          <MetricSection title="Sleep" icon={BedDouble} metrics={sleepMetrics.map(createMetricProps)} />
        )}
        {fitnessMetrics.length > 0 && (
          <MetricSection title="Fitness" icon={Footprints} metrics={fitnessMetrics.map(createMetricProps)} />
        )}
        {macroMetrics.length > 0 && (
          <MetricSection title="Macros" icon={BarChart2} metrics={macroMetrics.map(createMetricProps)} />
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;