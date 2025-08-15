import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Heart, Scale, ClipboardCheck, BedDouble, Footprints, Activity, HeartPulse,
  Ruler, Waves, PlugZap, Hourglass, Wind, Timer, Watch, Microscope, Hand, BarChart2,
  Flame, Beef, Wheat, Donut, Link2, Nut, TrendingDown
} from 'lucide-react';
import { fetchHealthData } from '/src/services/healthService.js';
import { createSparklineData } from '/src/utils/dataUtils.js';
import MetricSection from '/src/features/health/components/MetricSection.jsx';
import MetricCard from '/src/features/health/components/MetricCard.jsx';
const WeightDeficitModal = React.lazy(() => import('/src/features/health/components/WeightDeficitModal.jsx'));
import Card from '/src/components/ui/Card.jsx';
import { getMetricCategoryInfo } from '/src/utils/healthCategories.js';
import LoadingIndicator from '/src/components/ui/LoadingIndicator.jsx';

const PairedMetricContainer = ({ children }) => (
  <div className="grid grid-cols-2 gap-4 md:contents">
    {children}
  </div>
);

const HealthDashboard = () => {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(null);
  const [isDeficitModalOpen, setDeficitModalOpen] = useState(false);

  const { data: healthData, isLoading, isError, error } = useQuery('healthData', fetchHealthData, {
    staleTime: 5 * 60 * 1000,
  });

  const {
    oura = [],
    withings = [],
    running = [],
    clinical = [],
    otherData = [],
    macros = [],
    processedData = [],
    weightVsDeficitData = [],
  } = healthData || {};

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) {
      setActiveModal(null);
      setDeficitModalOpen(false);
      return;
    }
    if (hash === 'cumulative_deficit') {
      setDeficitModalOpen(true);
    } else {
      const element = document.getElementById(hash);
      if (element && !isLoading) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setActiveModal(null);
      } else if (!isLoading) {
        setActiveModal(hash);
      }
    }
  }, [location.hash, isLoading]);

  const handleOpenModal = (dataKey) => {
    if (dataKey === 'cumulative_deficit') {
        setDeficitModalOpen(true);
    } else {
        setActiveModal(dataKey);
    }
    window.location.hash = dataKey;
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setDeficitModalOpen(false);
    const { pathname, search } = window.location;
    window.history.pushState("", document.title, pathname + search);
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading & processing health data..." />;
  }
  
  const hasData = (arr) => arr && arr.length > 0;

  if (isError || !hasData(processedData)) {
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

  const createMetricProps = (metric) => ({
    ...metric,
    isOpen: activeModal === metric.dataKey,
    onOpen: () => handleOpenModal(metric.dataKey),
    onClose: handleCloseModal,
  });

  const findLatestRecord = (data, key) => hasData(data) ? data.find(d => d[key] != null) : {};

  const latestHrv = findLatestRecord(processedData, 'average_hrv');
  const latestRhr = findLatestRecord(processedData, 'resting_heart_rate');
  const latestWeight = findLatestRecord(processedData, 'weight');
  const latestBodyFat = findLatestRecord(processedData, 'fat_ratio');
  const latestTotalSleep = findLatestRecord(processedData, 'total_sleep');
  const latestDeepSleep = findLatestRecord(processedData, 'deep_sleep_minutes');
  const latestSleepEfficiency = findLatestRecord(processedData, 'efficiency');
  const latestSleepDelay = findLatestRecord(processedData, 'delay');
  const latestVo2MaxWatch = findLatestRecord(processedData, 'vo2_max');
  const latestVo2MaxClinical = findLatestRecord(processedData, 'vo2_max_clinical');
  const latestPeakFlow = findLatestRecord(processedData, 'peak_flow');
  const latestLeftGrip = findLatestRecord(processedData, 'weak_grip');
  const latestRightGrip = findLatestRecord(processedData, 'strong_grip');
  const latest5k = findLatestRecord(processedData, 'five_k_seconds');
  const latestCaloriesIn = findLatestRecord(processedData, 'calories_kcal');
  const latestCaloriesOut = findLatestRecord(processedData, 'total_calories');
  const latestCalorieDelta = findLatestRecord(processedData, 'calorie_delta');
  const latestCumulativeDeficit = findLatestRecord(processedData, 'calorie_delta_rolling_14d');
  const latestProtein = findLatestRecord(processedData, 'protein_g');
  const latestCarbs = findLatestRecord(processedData, 'carbs_g');
  const latestFat = findLatestRecord(processedData, 'fat_g');
  const latestSatFat = findLatestRecord(processedData, 'sat_fat_g');
  const latestSugar = findLatestRecord(processedData, 'sugar_g');
  
  // ---- Optional correlation badge (last 90d) for weight vs 14d deficit ----
  const corrLabel = useMemo(() => {
    if (!Array.isArray(weightVsDeficitData) || weightVsDeficitData.length === 0) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const pts = weightVsDeficitData.filter(d => {
      if (!d || !d.date) return false;
      const dt = new Date(String(d.date).length > 10 ? d.date : `${d.date}T00:00:00.000Z`);
      return dt >= cutoff && typeof d.weight === 'number' && typeof d.cumulativeDeficit === 'number';
    });
    if (pts.length < 10) return null;
    const xs = pts.map(p => p.cumulativeDeficit);
    const ys = pts.map(p => p.weight);
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const mx = mean(xs); const my = mean(ys);
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - mx;
      const dy = ys[i] - my;
      num += dx * dy;
      dx2 += dx * dx;
      dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    if (!denom) return null;
    const r = num / denom;
    const rounded = Math.round(r * 100) / 100;
    return `r = ${rounded} (90d)`;
  }, [weightVsDeficitData]);

  const metrics = {
    hrv: { title: "HRV", value: latestHrv?.average_hrv?.toFixed(0) ?? '--', unit: "ms", ...getMetricCategoryInfo('average_hrv', latestHrv?.average_hrv), sparklineData: createSparklineData(processedData, 'average_hrv'), icon: Activity, fullData: processedData, dataKey: "average_hrv", displayMode: 'compact' },
    rhr: { title: "RHR", value: latestRhr?.resting_heart_rate?.toFixed(0) ?? '--', unit: "bpm", ...getMetricCategoryInfo('resting_heart_rate', latestRhr?.resting_heart_rate), sparklineData: createSparklineData(processedData, 'resting_heart_rate'), icon: HeartPulse, fullData: processedData, dataKey: "resting_heart_rate", displayMode: 'compact' },
    weight: { title: "Weight", value: latestWeight?.weight?.toFixed(1) ?? '--', unit: "lbs", ...getMetricCategoryInfo('weight', latestWeight?.weight), sparklineData: createSparklineData(processedData, 'weight'), icon: Scale, fullData: processedData, dataKey: "weight", displayMode: 'compact' },
    bodyFat: { title: "Body Fat", value: latestBodyFat?.fat_ratio?.toFixed(1) ?? '--', unit: "%", ...getMetricCategoryInfo('fat_ratio', latestBodyFat?.fat_ratio), sparklineData: createSparklineData(processedData, 'fat_ratio'), icon: Ruler, fullData: processedData, dataKey: "fat_ratio", displayMode: 'compact' },
    calorieDelta: { title: "Calorie Delta", value: latestCalorieDelta?.calorie_delta?.toLocaleString() ?? '--', unit: "kcal", ...getMetricCategoryInfo('calorie_delta', latestCalorieDelta?.calorie_delta), sparklineData: createSparklineData(processedData, 'calorie_delta'), icon: TrendingDown, fullData: processedData, dataKey: "calorie_delta", displayMode: 'compact' },
    cumulativeDeficit: {
      title: "14d Calorie Deficit",
      value: latestCumulativeDeficit?.calorie_delta_rolling_14d?.toLocaleString() ?? '--',
      unit: "kcal",
      label: corrLabel || null,
      ...getMetricCategoryInfo('calorie_delta_rolling_14d', latestCumulativeDeficit?.calorie_delta_rolling_14d),
      sparklineData: createSparklineData(processedData, 'calorie_delta_rolling_14d'),
      icon: TrendingDown,
      fullData: weightVsDeficitData,
      dataKey: "cumulative_deficit",
      displayMode: 'compact'
    },
    totalSleep: { title: "Total Sleep", value: latestTotalSleep?.total_sleep?.toFixed(1) ?? '--', unit: "h", ...getMetricCategoryInfo('total_sleep', latestTotalSleep?.total_sleep), sparklineData: createSparklineData(processedData, 'total_sleep'), icon: BedDouble, fullData: processedData, dataKey: "total_sleep", displayMode: 'full' },
    deepSleep: { title: "Deep Sleep", value: latestDeepSleep?.deep_sleep_minutes?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('deep_sleep_minutes', latestDeepSleep?.deep_sleep_minutes), sparklineData: createSparklineData(processedData, 'deep_sleep_minutes'), icon: Waves, fullData: processedData, dataKey: "deep_sleep_minutes", displayMode: 'full' },
    sleepEfficiency: { title: "Sleep Efficiency", value: latestSleepEfficiency?.efficiency?.toFixed(0) ?? '--', unit: "%", ...getMetricCategoryInfo('efficiency', latestSleepEfficiency?.efficiency), sparklineData: createSparklineData(processedData, 'efficiency'), icon: PlugZap, fullData: processedData, dataKey: "efficiency", displayMode: 'compact' },
    sleepDelay: { title: "Sleep Delay", value: latestSleepDelay?.delay?.toFixed(0) ?? '--', unit: "min", ...getMetricCategoryInfo('delay', latestSleepDelay?.delay), sparklineData: createSparklineData(processedData, 'delay'), icon: Hourglass, fullData: processedData, dataKey: "delay", displayMode: 'compact' },
    caloriesOut: { title: "Calories Burned", value: latestCaloriesOut?.total_calories?.toLocaleString() ?? '--', unit: "kcal", ...getMetricCategoryInfo('total_calories', latestCaloriesOut?.total_calories), sparklineData: createSparklineData(processedData, 'total_calories'), icon: Flame, fullData: processedData, dataKey: "total_calories", displayMode: 'compact' },
    vo2MaxWatch: { title: "VO2 Max (Watch)", value: latestVo2MaxWatch?.vo2_max?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max', latestVo2MaxWatch?.vo2_max), sparklineData: createSparklineData(running, 'vo2_max'), icon: Watch, fullData: running, dataKey: "vo2_max", displayMode: 'compact' },
    vo2MaxClinical: { title: "VO2 Max (Clinical)", value: latestVo2MaxClinical?.vo2_max_clinical?.toFixed(1) ?? '--', unit: "", ...getMetricCategoryInfo('vo2_max_clinical', latestVo2MaxClinical?.vo2_max_clinical), sparklineData: createSparklineData(clinical, 'vo2_max_clinical'), icon: Microscope, fullData: clinical, dataKey: "vo2_max_clinical", displayMode: 'compact' },
    peakFlow: { title: "Peak Flow", value: latestPeakFlow?.peak_flow?.toFixed(0) ?? '--', unit: "L/min", ...getMetricCategoryInfo('peak_flow', latestPeakFlow?.peak_flow), sparklineData: createSparklineData(otherData, 'peak_flow'), icon: Wind, fullData: otherData, dataKey: "peak_flow", displayMode: 'compact' },
    leftGrip: { title: "Left Hand Grip", value: latestLeftGrip?.weak_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('weak_grip', latestLeftGrip?.weak_grip), sparklineData: createSparklineData(otherData, 'weak_grip'), icon: Hand, fullData: otherData, dataKey: "weak_grip", displayMode: 'compact' },
    rightGrip: { title: "Right Hand Grip", value: latestRightGrip?.strong_grip?.toFixed(1) ?? '--', unit: "kg", ...getMetricCategoryInfo('strong_grip', latestRightGrip?.strong_grip), sparklineData: createSparklineData(otherData, 'strong_grip'), icon: Hand, fullData: otherData, dataKey: "strong_grip", displayMode: 'compact' },
    fiveK: { title: "5K Time", value: latest5k?.five_k_formatted ?? '--:--', unit: "", ...getMetricCategoryInfo('five_k_seconds', latest5k?.five_k_seconds), sparklineData: createSparklineData(running, 'five_k_seconds'), icon: Timer, fullData: running, dataKey: "five_k_seconds", displayMode: 'compact' },
    tenK: { title: "10K Time", value: '--:--', unit: "", ...getMetricCategoryInfo('ten_k_seconds', null), sparklineData: [], icon: Timer, fullData: [], dataKey: "ten_k_seconds", displayMode: 'compact' },
    caloriesIn: {
      title: "Calories Consumed",
      value: (latestCaloriesIn?.calories_kcal != null)
        ? Math.round(latestCaloriesIn.calories_kcal).toLocaleString()
        : '--',
      unit: "kcal",
      ...getMetricCategoryInfo('calories_kcal', latestCaloriesIn?.calories_kcal),
      sparklineData: createSparklineData(macros, 'calories_kcal'),
      icon: Flame,
      fullData: macros,
      dataKey: "calories_kcal",
      displayMode: 'full'
    },
    protein: { title: "Protein", value: latestProtein?.protein_g != null ? Math.round(latestProtein.protein_g) : '--', unit: "g", ...getMetricCategoryInfo('protein_g', latestProtein?.protein_g), sparklineData: createSparklineData(macros, 'protein_g'), icon: Beef, fullData: macros, dataKey: "protein_g", displayMode: 'full' },
    carbs: { title: "Carbs", value: latestCarbs?.carbs_g != null ? Math.round(latestCarbs.carbs_g) : '--', unit: "g", ...getMetricCategoryInfo('carbs_g', latestCarbs?.carbs_g), sparklineData: createSparklineData(macros, 'carbs_g'), icon: Wheat, fullData: macros, dataKey: "carbs_g", displayMode: 'compact' },
    fat: { title: "Fat", value: latestFat?.fat_g != null ? Math.round(latestFat.fat_g) : '--', unit: "g", ...getMetricCategoryInfo('fat_g', latestFat?.fat_g), sparklineData: createSparklineData(macros, 'fat_g'), icon: Nut, fullData: macros, dataKey: "fat_g", displayMode: 'compact' },
    satFat: { title: "Saturated Fat", value: latestSatFat?.sat_fat_g != null ? Math.round(latestSatFat.sat_fat_g) : '--', unit: "g", ...getMetricCategoryInfo('sat_fat_g', latestSatFat?.sat_fat_g), sparklineData: createSparklineData(macros, 'sat_fat_g'), icon: Link2, fullData: macros, dataKey: "sat_fat_g", displayMode: 'compact' },
    sugar: { title: "Sugar", value: latestSugar?.sugar_g != null ? Math.round(latestSugar.sugar_g) : '--', unit: "g", ...getMetricCategoryInfo('sugar_g', latestSugar?.sugar_g), sparklineData: createSparklineData(macros, 'sugar_g'), icon: Donut, fullData: macros, dataKey: "sugar_g", displayMode: 'compact' },
  };

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
        {hasData(oura) && (
          <MetricSection title="Heart" icon={Heart}>
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.hrv)} />
              <MetricCard {...createMetricProps(metrics.rhr)} />
            </PairedMetricContainer>
          </MetricSection>
        )}
        {hasData(withings) && (
          <MetricSection title="Body" icon={ClipboardCheck}>
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.weight)} />
              <MetricCard {...createMetricProps(metrics.bodyFat)} />
            </PairedMetricContainer>
             <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.calorieDelta)} />
                <MetricCard {...createMetricProps(metrics.cumulativeDeficit)} />
             </PairedMetricContainer>
          </MetricSection>
        )}
        {hasData(oura) && (
          <MetricSection title="Sleep" icon={BedDouble}>
            <MetricCard {...createMetricProps(metrics.totalSleep)} />
            <MetricCard {...createMetricProps(metrics.deepSleep)} />
            <PairedMetricContainer>
              <MetricCard {...createMetricProps(metrics.sleepEfficiency)} />
              <MetricCard {...createMetricProps(metrics.sleepDelay)} />
            </PairedMetricContainer>
          </MetricSection>
        )}
        {(hasData(running) || hasData(clinical) || hasData(otherData) || hasData(oura)) && (
          <MetricSection title="Fitness" icon={Footprints}>
            {latestVo2MaxWatch && latestVo2MaxClinical && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.vo2MaxWatch)} />
                <MetricCard {...createMetricProps(metrics.vo2MaxClinical)} />
              </PairedMetricContainer>
            )}
            {latestCaloriesOut && latestPeakFlow && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.caloriesOut)} />
                <MetricCard {...createMetricProps(metrics.peakFlow)} />
              </PairedMetricContainer>
            )}
             {latestLeftGrip && latestRightGrip && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.leftGrip)} />
                <MetricCard {...createMetricProps(metrics.rightGrip)} />
              </PairedMetricContainer>
            )}
            {latest5k && (
              <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.fiveK)} />
                <MetricCard {...createMetricProps(metrics.tenK)} />
              </PairedMetricContainer>
            )}
          </MetricSection>
        )}
        {hasData(macros) && (
           <MetricSection title="Macros" icon={BarChart2}>
             <MetricCard {...createMetricProps(metrics.caloriesIn)} />
             <MetricCard {...createMetricProps(metrics.protein)} />
             <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.fat)} />
                <MetricCard {...createMetricProps(metrics.satFat)} />
             </PairedMetricContainer>
             <PairedMetricContainer>
                <MetricCard {...createMetricProps(metrics.carbs)} />
                <MetricCard {...createMetricProps(metrics.sugar)} />
             </PairedMetricContainer>
           </MetricSection>
        )}
      </div>
      
      <Suspense fallback={null}>
        <WeightDeficitModal 
          isOpen={isDeficitModalOpen}
          onClose={handleCloseModal}
          data={weightVsDeficitData}
        />
      </Suspense>
    </div>
  );
};

export default HealthDashboard;
