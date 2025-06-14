// src/config/metricInfo.js
// This file contains the descriptive text for health metrics displayed in the app.

export const METRIC_INFO = {
  average_hrv: {
    title: 'Heart Rate Variability (HRV)',
    description: 'HRV measures the variation in time between each heartbeat. It is controlled by the autonomic nervous system (ANS) and is a key indicator of cardiovascular health and your body\'s resilience to stress. A higher HRV is generally considered better, signifying a well-rested and recovered state. This data is typically collected by a wearable device during sleep.'
  },
  resting_heart_rate: {
    title: 'Resting Heart Rate (RHR)',
    description: 'RHR is the number of times your heart beats per minute while you are at complete rest. It is a common indicator of overall cardiovascular fitness and heart efficiency. A lower RHR is generally better. This data is usually captured overnight or upon waking before activity.'
  },
  vo2_max: {
    title: 'VO₂ Max (Cardiorespiratory Fitness)',
    description: 'VO₂ Max is the maximum rate of oxygen your body can utilize during intense exercise. It is widely considered the best indicator of a person\'s cardiovascular endurance and aerobic fitness. A higher VO₂ Max means your body is more efficient at taking in oxygen and delivering it to your muscles. This metric is estimated by fitness trackers based on heart rate response during runs.'
  },
  vo2_max_clinical: {
    title: 'VO₂ Max (Clinical)',
    description: 'This is a clinical measurement of VO₂ Max, typically determined through a graded exercise test in a laboratory setting. It is the gold standard for measuring cardiorespiratory fitness and is more accurate than estimates from consumer wearables.'
  },
  peak_flow: {
    title: 'Peak Expiratory Flow (PEF)',
    description: 'Peak Flow measures how quickly you can exhale air after a maximum inhalation. It\'s a key measurement for monitoring respiratory conditions like asthma, as it indicates how open the airways in the lungs are. A higher value is better. This measurement is taken using a handheld peak flow meter.'
  },
  calories_kcal: {
    title: 'Caloric Intake',
    description: 'This metric tracks the total number of kilocalories consumed per day. Managing caloric intake is a fundamental component of weight management. The target is based on individual factors like age, sex, weight, height, and activity level.'
  },
  protein_g: {
    title: 'Protein Intake',
    description: 'This metric measures the total grams of protein consumed. Protein is a crucial macronutrient essential for building and repairing tissues, making enzymes and hormones, and supporting muscle mass. The target intake depends on factors like body weight and fitness goals.'
  },
  fat_g: {
    title: 'Fat Intake',
    description: 'This measures the total grams of dietary fat consumed. Fats are an essential macronutrient used for energy, hormone production, and absorbing vitamins. Tracking fat intake helps in balancing overall nutrition.'
  },
  carbs_g: {
    title: 'Carbohydrate Intake',
    description: 'This metric tracks the total grams of carbohydrates consumed. Carbohydrates are the body\'s primary source of energy. The quality and quantity of carbs are important for managing energy levels and overall health.'
  },
  default: {
    title: 'Metric Information',
    description: 'A description for this metric has not been defined yet.'
  }
};