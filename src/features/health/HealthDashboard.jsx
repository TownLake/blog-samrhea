// src/features/health/HealthDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand, BarChart2,
  Flame, Beef, Wheat, Donut, Link2, Nut
} from 'lucide-react';
import { createSparklineData } from '/src/utils/dataUtils.js';
import { fetchHealthData } from '/src/services/healthService.js';
import MetricSection from '/src/features/health/components/MetricSection.jsx';
import MetricCard from '/src/features/health/components/MetricCard.jsx';
import Card from '/src/components/ui/Card.jsx';
import { getMetricCategoryInfo } from '/src/utils/healthCategories.js';
import LoadingIndicator from '/src/components/ui/LoadingIndicator.jsx';
import StatusMessage from '/src/components/ui/StatusMessage.jsx';

const PairedMetricContainer = ({ children }) => (
  <div className="grid grid-cols-2 gap-4 md:contents">
    {children}
  </div>
);

const HealthDashboard = () => {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(null);

  const { data: healthData, isLoading, isError, error } = useQuery('healthData', fetchHealthData);

  const {
    oura = [], ouraSpark = [],
    withings = [],
    running = [], runningSpark = [],
    clinical = [], clinicalSpark = [],
    otherData = [], otherDataSpark = [],
    macros = [], macrosSpark = [],
  } = healthData || {};

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
    return <LoadingIndicator message="Loading health data..." />;
  }

  const hasData = (arr) => arr && arr.length > 0;

  if (isError || (!hasData(oura) && !hasData(withings) && !hasData(running) && !hasData(otherData) && !hasData(macros))) {
    return (
      <div className="py-10 max-w-xl mx-auto text-center">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Unable to Load Health Data
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {error?.message || "An error occurred while loading your health data."}
          </p>
        </Card>
      </div>
    );
  }

  const createMetricProps = (metric, displayMode = 'full') => ({
    ...metric,
    displayMode,
    isOpen: activeModal === metric.dataKey,
    onOpen: () => handleOpenModal(metric.dataKey),
    onClose: handleCloseModal,
  });

  const findLatestRecord = (data, key) => hasData(data) ? data.find(d => d[key] != null) : {};
  
  const latestHrv = findLatestRecord(oura, 'average_hrv');
  const latestRhr = findLatestRecord(oura, 'resting_heart_rate');
  const latestWeight = findLatestRecord(withings, 'weight');
  const latestBodyFat = findLatestRecord(withings, 'fat_ratio');
  const latestTotalSleep = findLatestRecord(oura, 'total_sleep');
  const latestDeepSleep = findLatestRecord(oura, 'deep_sleep_minutes');
  const latestSleepEfficiency = findLatestRecord(oura, 'efficiency');
  const latestSleepDelay = findLatestRecord(oura, 'delay');
  const latestVo2MaxWatch = findLatestRecord(running, 'vo2_max');
  const latestVo2MaxClinical = findLatestRecord(clinical, 'vo2_max_clinical');
  const latestPowerBreathe = findLatestRecord(otherData, 'power_breathe_level');
  const latestPeakFlow = findLatestRecord(otherData, 'peak_flow');
  const latestLeftGrip = findLatestRecord(otherData, 'weak_grip');
  const latestRightGrip = findLatestRecord(otherData, 'strong_grip');
  const latest5k = findLatestRecord(running, 'five_k_seconds');
  const latestCalories = findLatestRecord(macros, 'calories_kcal');
  const latestProtein = findLatestRecord(macros, 'protein_g');
  const latestCarbs = findLatestRecord(macros, 'carbs_g');
  const latestFat = findLatestRecord(macros, 'fat_g');
  const latestSatFat = findLatestRecord(macros, 'sat_fat_g');
  const latestSugar = findLatestRecord(macros, 'sugar_g');

  const metrics = {
    hrv: { title: "HRV", value: latestHrv?.average_hrv?.toFixed(0) ?? '--', unit: "ms", ...getMetricCategoryInfo('average_hrv', latestHrv?.average_hrv), sparklineData: createSparklineData(ouraSpark, 'average_hrv'), icon: Activity, fullData: oura, dataKey: "average_hrv" },
    rhr: { title: "RHR", value: latestRhr?.resting_heart_rate?.toFixed(0) ?? '--', unit: "bpm", ...getMetricCategoryInfo('resting_heart_rate', latestRhr?.resting_heart_rate), sparklineData: createSparklineData(ouraSpark, 'resting_heart_rate'), icon: HeartPulse, fullData: oura, dataKey: "resting_heart_rate" },
    weight: { title: "Weight", value: latestWeight?.weight?.toFixed(1) ?? '--', unit: "lbs", ...getMetricCategoryInfo('weight', latestWeight?.weight), sparklineData: createSparklineData(withings, 'weight'), icon: Scale, fullData: withings, dataKey: "weight" },
    bodyFat: { title: "Body Fat", value: latestBodyFat?.fat_ratio?.toFixed(1) ?? '--', unit: "%", ...getMetricCategoryInfo('fat_ratio', latestBodyFat?.fat_ratio), sparklineData: createSparklineData(withings, 'fat_ratio'), icon: Ruler, fullData: withings, dataKey: "fat_ratio" },
    totalSleep: { title: "Total Sleep", value: latestTotalSleep?.total_sleep?.toFixed(1) ?? '--', unit: "h", ...getMetricCategoryInfo('total_sleep', latestTotalSleep?.total_sleep), sparklineData: createSparklineData(ouraSpark, 'total_sleep'), icon: BedDouble, fullData: oura, dataKey: "total_sleep" },
    deepSleep: { title: "Deep Sleep", value: latestDeepSleep?.deep_sleep_minutes?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('deep_sleep_minutes', latestDeepSleep?.deep_sleep_minutes), sparklineData: createSparklineData(ouraSpark, 'deep_sleep_minutes'), icon: Waves, fullData: oura, dataKey: "deep_sleep_minutes" },
    sleepEfficiency: { title: "Sleep Efficiency", value: latestSleepEfficiency?.efficiency?.toFixed(0) ?? '--', unit: "%", ...getMetricCategoryInfo('efficiency', latestSleepEfficiency?.efficiency), sparklineData: createSparklineData(ouraSpark, 'efficiency'), icon: PlugZap, fullData: oura, dataKey: "efficiency" },
    sleepDelay: { title: "Sleep Delay", value: latestSleepDelay?.delay?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('delay', latestSleepDelay?.delay), sparklineData: createSparklineData(ouraSpark, 'delay'), icon: Hourglass, fullData: oura, dataKey: "delay" },
    vo2MaxWatch: { title: "VO2 Max (Watch)", value: latestVo2MaxWatch?.vo2_max?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max', latestVo2MaxWatch?.vo2_max), sparklineData: createSparklineData(runningSpark, 'vo2_max'), icon: Watch, fullData: running, dataKey: "vo2_max" },
    vo2MaxClinical: { title: "VO2 Max (Clinical)", value: latestVo2MaxClinical?.vo2_max_clinical?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max_clinical', latestVo2MaxClinical?.vo2_max_clinical), sparklineData: createSparklineData(clinicalSpark, 'vo2_max_clinical'), icon: Microscope, fullData: clinical, dataKey: "vo2_max_clinical" },
    powerBreathe: { title: "Power Breathe", value: latestPowerBreathe?.power_breathe_level?.toFixed(1) ?? '--', unit: "Level", ...getMetricCategoryInfo('power_breathe_level', latestPowerBreathe?.power_breathe_level), sparklineData: createSparklineData(otherDataSpark, 'power_breathe_level'), icon: Timer, fullData: otherData, dataKey: "power_breathe_level" },
    peakFlow: { title: "Peak Flow", value: latestPeakFlow?.peak_flow?.toFixed(0) ?? '--', unit: "L/min", ...getMetricCategoryInfo('peak_flow', latestPeakFlow?.peak_flow), sparklineData: createSparklineData(otherDataSpark, 'peak_flow'), icon: Wind, fullData: otherData, dataKey: "peak_flow" },
    leftGrip: { title: "Left Hand Grip", value: latestLeftGrip?.weak_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('weak_grip', latestLeftGrip?.weak_grip), sparklineData: createSparklineData(otherDataSpark, 'weak_grip'), icon: Hand, fullData: otherData, dataKey: "weak_grip" },
    rightGrip: { title: "Right Hand Grip", value: latestRightGrip?.strong_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('strong_grip', latestRightGrip?.strong_grip), sparklineData: createSparklineData(otherDataSpark, 'strong_grip'), icon: Hand, fullData: otherData, dataKey: "strong_grip" },
    fiveK: { title: "5K Time", value: latest5k?.five_k_formatted ?? '--:--', unit: "", ...getMetricCategoryInfo('five_k_seconds', latest5k?.five_k_seconds), sparklineData: createSparklineData(runningSpark, 'five_k_seconds'), icon: Timer, fullData: running, dataKey: "five_k_seconds" },
    tenK: { title: "10K Time", value: '--:--', unit: "", ...getMetricCategoryInfo('ten_k_seconds', null), sparklineData: [], icon: Timer, fullData: [], dataKey: "ten_k_seconds" },
    calories: { title: "Calories", value: latestCalories?.calories_kcal?.toLocaleString() ?? '--', unit: "kcal", ...getMetricCategoryInfo('calories_kcal', latestCalories?.calories_kcal), sparklineData: createSparklineData(macrosSpark, 'calories_kcal'), icon: Flame, fullData: macros, dataKey: "calories_kcal" },
    protein: { title: "Protein", value: latestProtein?.protein_g != null ? Math.round(latestProtein.protein_g) : '--', unit: "g", ...getMetricCategoryInfo('protein_g', latestProtein?.protein_g), sparklineData: createSparklineData(macrosSpark, 'protein_g'), icon: Beef, fullData: macros, dataKey: "protein_g" },
    carbs: { title: "Carbs", value: latestCarbs?.carbs_g != null ? Math.round(latestCarbs.carbs_g) : '--', unit: "g", ...getMetricCategoryInfo('carbs_g', latestCarbs?.carbs_g), sparklineData: createSparklineData(macrosSpark, 'carbs_g'), icon: Wheat, fullData: macros, dataKey: "carbs_g" },
    fat: { title: "Fat", value: latestFat?.fat_g != null ? Math.round(latestFat.fat_g) : '--', unit: "g", ...getMetricCategoryInfo('fat_g', latestFat?.fat_g), sparklineData: createSparklineData(macrosSpark, 'fat_g'), icon: Nut, fullData: macros, dataKey: "fat_g" },
    satFat: { title: "Saturated Fat", value: latestSatFat?.sat_fat_g != null ? Math.round(latestSatFat.sat_fat_g) : '--', unit: "g", ...getMetricCategoryInfo('sat_fat_g', latestSatFat?.sat_fat_g), sparklineData: createSparklineData(macrosSpark, 'sat_fat_g'), icon: Link2, fullData: macros, dataKey: "sat_fat_g" },
    sugar: { title: "Sugar", value: latestSugar?.sugar_g != null ? Math.round(latestSugar.sugar_g) : '--', unit: "g", ...getMetricCategoryInfo('sugar_g', latestSugar?.sugar_g), sparklineData: createSparklineData(macrosSpark, 'sugar_g'), icon: Donut, fullData: macros, dataKey: "sugar_g" },
  };

  const hasHeartData = hasData(oura);
  const hasBodyData = hasData(withings);
  const hasSleepData = hasData(oura);
  const hasFitnessData = hasData(running) || hasData(clinical) || hasData(otherData);
  const hasMacrosData = hasData(macros);

  return (
    <div className="pt-2 pb-8">
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Health Data
          </h2>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <p>I publish these to have a home page for myself. I think <a href="https://blog.samrhea.com/post/2024-01-30-health-data" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">a lot</a> about this kind of data. And, if you're like me, you could use this <a href="https://github.com/TownLake/core-health" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">open-sourced dashboard</a> I built, too.</p>
        </div>
      </Card>

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
            {latestVo2MaxWatch && latestVo2MaxClinical && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.vo2MaxWatch, 'compact')} />
                <MetricCard {...createMetricProps(metrics.vo2MaxClinical, 'compact')} />
              </PairedMetricContainer>
            )}
            {latestPowerBreathe && latestPeakFlow && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.powerBreathe, 'compact')} />
                <MetricCard {...createMetricProps(metrics.peakFlow, 'compact')} />
              </PairedMetricContainer>
            )}
             {latestLeftGrip && latestRightGrip && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.leftGrip, 'compact')} />
                <MetricCard {...createMetricProps(metrics.rightGrip, 'compact')} />
              </PairedMetricContainer>
            )}
            {latest5k && (
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