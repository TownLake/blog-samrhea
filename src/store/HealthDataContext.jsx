// src/store/HealthDataContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchHealthData } from '../services/healthService';

// Create context
const HealthDataContext = createContext();

// Custom hook to use the context
export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

// Provider component
export const HealthDataProvider = ({ children }) => {
  const [ouraData, setOuraData] = useState([]);
  const [withingsData, setWithingsData] = useState([]);
  const [runningData, setRunningData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch health data from API
        const data = await fetchHealthData();
        
        if (data) {
          setOuraData(data.oura || []);
          setWithingsData(data.withings || []);
          setRunningData(data.running || []);
        }
      } catch (err) {
        setError('Failed to load health data');
        console.error('Failed to load health data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHealthData();
  }, []);

  // Values to be provided by the context
  const value = {
    ouraData,
    withingsData,
    runningData,
    isLoading,
    error
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export default HealthDataContext;