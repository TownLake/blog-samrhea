// src/components/data/health/HealthDashboard.jsx
import React, { useState, useEffect } from 'react';
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
  // On mobile, this creates a 2-column grid for the paired "cube" cards.
  // On desktop, `md:contents` makes this div disappear from the layout,
  // allowing its children to become direct children of the parent grid,
  // which preserves the overall 2-column desktop layout.
  <div className="grid grid-cols-2 gap-4 md:contents">
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
    // Modal and scrolling logic remains the same
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

  if (!hasData(oura) && !hasData(withings) && !hasData(running) && !hasData(otherData) && !hasData(macros)) {
    return <ErrorView message={error || "No relevant health data available to display."} />;
  }

  const createMetricProps = (metric, displayMode = 'full') => ({
    ...metric,
    displayMode,
    isOpen: activeModal === metric.dataKey,
    onOpen: () => handleOpenModal(metric.dataKey),
    onClose: handleCloseModal,
  });

  // --- Define Metric Data ---
  const latestOura = hasData(oura) ? oura[0] : {};
  const latestWithings = hasData(withings) ? withings[0] : {};
  const latestRunning = hasData(running) ? running[0] : {};
  const latestClinicalData = hasData(clinical) ? clinical[0] : {};
  const latestOtherData = hasData(otherData) ? otherData[0] : {};
  const latestMacros = hasData(macros) ? macros[0] : {};

  // All metric definitions remain the same, just organized for rendering
  const metrics = {
    hrv: { title: "HRV", value: latestOura.average_hrv?.toFixed(0) ?? '--', unit: "ms", ...getMetricCategoryInfo('average_hrv', latestOura.average_hrv), sparklineData: createSparklineData(ouraSpark, 'average_hrv'), icon: Activity, fullData: oura, dataKey: "average_hrv" },
    rhr: { title: "Resting Heart Rate", value: latestOura.resting_heart_rate?.toFixed(0) ?? '--', unit: "bpm", ...getMetricCategoryInfo('resting_heart_rate', latestOura.resting_heart_rate), sparklineData: createSparklineData(ouraSpark, 'resting_heart_rate'), icon: HeartPulse, fullData: oura, dataKey: "resting_heart_rate" },
    weight: { title: "Weight", value: latestWithings.weight?.toFixed(1) ?? '--', unit: "lbs", ...getMetricCategoryInfo('weight', latestWithings.weight), sparklineData: createSparklineData(withings, 'weight'), icon: Scale, fullData: withings, dataKey: "weight" },
    bodyFat: { title: "Body Fat", value: latestWithings.fat_ratio?.toFixed(1) ?? '--', unit: "%", ...getMetricCategoryInfo('fat_ratio', latestWithings.fat_ratio), sparklineData: createSparklineData(withings, 'fat_ratio'), icon: Ruler, fullData: withings, dataKey: "fat_ratio" },
    totalSleep: { title: "Total Sleep", value: latestOura.total_sleep?.toFixed(1) ?? '--', unit: "h", ...getMetricCategoryInfo('total_sleep', latestOura.total_sleep), sparklineData: createSparklineData(ouraSpark, 'total_sleep'), icon: BedDouble, fullData: oura, dataKey: "total_sleep" },
    deepSleep: { title: "Deep Sleep", value: latestOura.deep_sleep_minutes?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('deep_sleep_minutes', latestOura.deep_sleep_minutes), sparklineData: createSparklineData(ouraSpark, 'deep_sleep_minutes'), icon: Waves, fullData: oura, dataKey: "deep_sleep_minutes" },
    sleepEfficiency: { title: "Sleep Efficiency", value: latestOura.efficiency?.toFixed(0) ?? '--', unit: "%", ...getMetricCategoryInfo('efficiency', latestOura.efficiency), sparklineData: createSparklineData(ouraSpark, 'efficiency'), icon: PlugZap, fullData: oura, dataKey: "efficiency" },
    sleepDelay: { title: "Sleep Delay", value: latestOura.delay?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('delay', latestOura.delay), sparklineData: createSparklineData(ouraSpark, 'delay'), icon: Hourglass, fullData: oura, dataKey: "delay" },
    vo2MaxWatch: hasData(running) ? { title: "VO2 Max (Watch)", value: latestRunning.vo2_max?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max', latestRunning.vo2_max), sparklineData: createSparklineData(runningSpark, 'vo2_max'), icon: Watch, fullData: running, dataKey: "vo2_max" } : null,
    vo2MaxClinical: hasData(clinical) && latestClinicalData?.vo2_max_clinical ? { title: "VO2 Max (Clinical)", value: latestClinicalData.vo2_max_clinical?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max_clinical', latestClinicalData.vo2_max_clinical), sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'), icon: Microscope, fullData: clinical, dataKey: "vo2_max_clinical" } : null,
    powerBreathe: hasData(otherData) ? { title: "Power Breathe", value: latestOtherData.power_breathe_level?.toFixed(1) ?? '--', unit: "Level", ...getMetricCategoryInfo('power_breathe_level', latestOtherData.power_breathe_level), sparklineData: createSparklineData(otherDataSpark, 'power_breathe_level'), icon: Timer, fullData: otherData, dataKey: "power_breathe_level" } : null,
    peakFlow: hasData(otherData) ? { title: "Peak Flow", value: latestOtherData.peak_flow?.toFixed(0) ?? '--', unit: "L/min", ...getMetricCategoryInfo('peak_flow', latestOtherData.peak_flow), sparklineData: createSparklineData(otherDataSpark, 'peak_flow'), icon: Wind, fullData: otherData, dataKey: "peak_flow" } : null,
    leftGrip: hasData(otherData) ? { title: "Left Hand Grip", value: latestOtherData.weak_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('weak_grip', latestOtherData.weak_grip), sparklineData: createSparklineData(otherDataSpark, 'weak_grip'), icon: Hand, fullData: otherData, dataKey: "weak_grip" } : null,
    rightGrip: hasData(otherData) ? { title: "Right Hand Grip", value: latestOtherData.strong_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('strong_grip', latestOtherData.strong_grip), sparklineData: createSparklineData(otherDataSpark, 'strong_grip'), icon: Hand, fullData: otherData, dataKey: "strong_grip" } : null,
    fiveK: hasData(running) ? { title: "5K Time", value: latestRunning.five_k_formatted ?? '--:--', unit: "", ...getMetricCategoryInfo('five_k_seconds', latestRunning.five_k_seconds), sparklineData: createSparklineData(runningSpark, 'five_k_seconds'), icon: Timer, fullData: running, dataKey: "five_k_seconds" } : null,
    tenK: { title: "10K Time", value: '--:--', unit: "", ...getMetricCategoryInfo('ten_k_seconds', null), sparklineData: [], icon: Timer, fullData: [], dataKey: "ten_k_seconds" },
    calories: { title: "Calories", value: latestMacros.calories_kcal?.toLocaleString() ?? '--', unit: "kcal", ...getMetricCategoryInfo('calories_kcal', latestMacros.calories_kcal), sparklineData: createSparklineData(macrosSpark, 'calories_kcal'), icon: Flame, fullData: macros, dataKey: "calories_kcal" },
    protein: { title: "Protein", value: latestMacros.protein_g != null ? Math.round(latestMacros.protein_g) : '--', unit: "g", ...getMetricCategoryInfo('protein_g', latestMacros.protein_g), sparklineData: createSparklineData(macrosSpark, 'protein_g'), icon: Beef, fullData: macros, dataKey: "protein_g" },
    carbs: { title: "Carbs", value: latestMacros.carbs_g != null ? Math.round(latestMacros.carbs_g) : '--', unit: "g", ...getMetricCategoryInfo('carbs_g', latestMacros.carbs_g), sparklineData: createSparklineData(macrosSpark, 'carbs_g'), icon: Wheat, fullData: macros, dataKey: "carbs_g" },
    fat: { title: "Fat", value: latestMacros.fat_g != null ? Math.round(latestMacros.fat_g) : '--', unit: "g", ...getMetricCategoryInfo('fat_g', latestMacros.fat_g), sparklineData: createSparklineData(macrosSpark, 'fat_g'), icon: Nut, fullData: macros, dataKey: "fat_g" },
    satFat: { title: "Saturated Fat", value: latestMacros.sat_fat_g != null ? Math.round(latestMacros.sat_fat_g) : '--', unit: "g", ...getMetricCategoryInfo('sat_fat_g', latestMacros.sat_fat_g), sparklineData: createSparklineData(macrosSpark, 'sat_fat_g'), icon: Link2, fullData: macros, dataKey: "sat_fat_g" },
    sugar: { title: "Sugar", value: latestMacros.sugar_g != null ? Math.round(latestMacros.sugar_g) : '--', unit: "g", ...getMetricCategoryInfo('sugar_g', latestMacros.sugar_g), sparklineData: createSparklineData(macrosSpark, 'sugar_g'), icon: Donut, fullData: macros, dataKey: "sugar_g" },
  };

  const hasHeartData = hasData(oura);
  const hasBodyData = hasData(withings);
  const hasSleepData = hasData(oura);
  const hasFitnessData = hasData(running) || hasData(clinical) || hasData(otherData);
  const hasMacrosData = hasData(macros);

  return (
    <div className="pt-2 pb-8">
      <DataIntroCard title="Health Data" icon={BarChart2}>
        <p>I publish these to have a home page for myself. I think <a href="https://blog.samrhea.com/post/2024-01-30-health-data" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">a lot</a> about this kind of data. And, if you're like me, you could use this <a href="https://github.com/TownLake/core-health" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">open-sourced dashboard</a> I built, too.</p>
      </DataIntroCard>

      <div className="space-y-12 mt-8">
        {hasHeartData && (
          <MetricSection title="Heart" icon={Heart}>
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.hrv, 'compact')} />
              <MetricCard {...createMetricProps(metrics.rhr, 'compact')} />
            </PairedMetricContainer>
          </MetricSection>
        )}
        {hasBodyData && (
          <MetricSection title="Body" icon={ClipboardCheck}>
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.weight, 'compact')} />
              <MetricCard {...createMetricProps(metrics.bodyFat, 'compact')} />
            </PairedMetricContainer>
          </MetricSection>
        )}
        {hasSleepData && (
          <MetricSection title="Sleep" icon={BedDouble}>
            <MetricCard {...createMetricProps(metrics.totalSleep, 'full')} />
            <MetricCard {...createMetricProps(metrics.deepSleep, 'full')} />
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.sleepEfficiency, 'compact')} />
              <MetricCard {...createMetricProps(metrics.sleepDelay, 'compact')} />
            </PairedMetricContainer>
          </MetricSection>
        )}
        {hasFitnessData && (
          <MetricSection title="Fitness" icon={Footprints}>
            {metrics.vo2MaxWatch && metrics.vo2MaxClinical && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.vo2MaxWatch, 'compact')} />
                <MetricCard {...createMetricProps(metrics.vo2MaxClinical, 'compact')} />
              </PairedMetricContainer>
            )}
            {metrics.powerBreathe && metrics.peakFlow && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.powerBreathe, 'compact')} />
                <MetricCard {...createMetricProps(metrics.peakFlow, 'compact')} />
              </PairedMetricContainer>
            )}
             {metrics.leftGrip && metrics.rightGrip && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.leftGrip, 'compact')} />
                <MetricCard {...createMetricProps(metrics.rightGrip, 'compact')} />
              </PairedMetricContainer>
            )}
            {metrics.fiveK && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.fiveK, 'compact')} />
                <MetricCard {...createMetricProps(metrics.tenK, 'compact')} />
              </PairedMetricContainer>
            )}
          </MetricSection>
        )}
        {hasMacrosData && (
           <MetricSection title="Macros" icon={BarChart2}>
             <MetricCard {...createMetricProps(metrics.calories, 'full')} />
             <MetricCard {...createMetricProps(metrics.protein, 'full')} />
             <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.fat, 'compact')} />
                <MetricCard {...createMetricProps(metrics.satFat, 'compact')} />
             </PairedMetricContainer>
             <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.carbs, 'compact')} />
                <MetricCard {...createMetricProps(metrics.sugar, 'compact')} />
             </PairedMetricContainer>
           </MetricSection>
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;