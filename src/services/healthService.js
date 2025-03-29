/**
 * Fetches health data from API endpoints
 * @returns {Promise<Object>} The health data from various sources
 */
export const fetchHealthData = async () => {
    try {
      // In a real application, these would be API calls
      // For demonstration, we're using simulated data
      
      // Mock data that follows the structure expected by the dashboard
      const mockData = {
        oura: generateOuraData(),
        withings: generateWithingsData(),
        running: generateRunningData()
      };
      
      return mockData;
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  };
  
  // Helper functions to generate mock data
  
  function generateOuraData() {
    const today = new Date();
    const data = [];
    
    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        average_hrv: 40 + Math.random() * 10,
        resting_heart_rate: 55 + Math.random() * 5,
        total_sleep: 6.5 + Math.random() * 1.5,
        deep_sleep_minutes: 60 + Math.random() * 30,
        efficiency: 85 + Math.random() * 10,
        delay: 10 + Math.random() * 10,
        is_fill_value_hrv: Math.random() > 0.9,
        is_fill_value_rhr: Math.random() > 0.9,
        is_fill_value_sleep: Math.random() > 0.9,
        is_fill_value_deep: Math.random() > 0.9,
        is_fill_value_efficiency: Math.random() > 0.9,
        is_fill_value_delay: Math.random() > 0.9
      });
    }
    
    return data;
  }
  
  function generateWithingsData() {
    const today = new Date();
    const data = [];
    
    // Base weight and slight downward trend
    let baseWeight = 185;
    
    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Slight downward trend in weight
      const dailyWeight = baseWeight - (i * 0.05) + (Math.random() * 0.8 - 0.4);
      
      data.push({
        date: date.toISOString().split('T')[0],
        weight: dailyWeight,
        fat_ratio: 18 + Math.random() * 2,
        is_fill_value_weight: Math.random() > 0.8,
        is_fill_value_fat: Math.random() > 0.8
      });
    }
    
    return data;
  }
  
  function generateRunningData() {
    const today = new Date();
    const data = [];
    
    // Base VO2 max and slight upward trend
    let baseVO2 = 45;
    // Base 5k time in seconds (20 minutes)
    let base5kSeconds = 1200;
    
    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Slight improvement in VO2 max and 5k time
      const dailyVO2 = baseVO2 + (i * 0.02) + (Math.random() * 0.6 - 0.3);
      const daily5kSeconds = base5kSeconds - (i * 0.4) + (Math.random() * 10 - 5);
      
      const minutes = Math.floor(daily5kSeconds / 60);
      const seconds = Math.floor(daily5kSeconds % 60);
      
      data.push({
        date: date.toISOString().split('T')[0],
        vo2_max: dailyVO2,
        five_k_seconds: daily5kSeconds,
        five_k_formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        is_fill_value_vo2: Math.random() > 0.7,
        is_fill_value_5k: Math.random() > 0.7
      });
    }
    
    return data;
  }