// src/store/HealthDataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchHealthData } from '../services/healthService';

const HealthDataContext = createContext();

export const HealthDataProvider = ({ children }) => {
  // State for all data types
  const [ouraSpark, setOuraSpark] = useState([]);
  const [oura, setOura] = useState([]);
  const [withings, setWithings] = useState([]);
  const [runningSpark, setRunningSpark] = useState([]);
  const [running, setRunning] = useState([]);
  const [clinicalSpark, setClinicalSpark] = useState([]);
  const [clinical, setClinical] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchHealthData();
        
        // Set all data with fallbacks to empty arrays
        setOuraSpark(data.ouraSpark || []);
        setOura(data.oura || []);
        setWithings(data.withings || []);
        setRunningSpark(data.runningSpark || []);
        setRunning(data.running || []);
        setClinicalSpark(data.clinicalSpark || []);
        setClinical(data.clinical || []);
      } catch (err) {
        console.error('Error loading health data:', err);
        setError(err.message || 'Failed to load health data');
        
        // Set empty arrays on error to prevent undefined access
        setOuraSpark([]);
        setOura([]);
        setWithings([]);
        setRunningSpark([]);
        setRunning([]);
        setClinicalSpark([]);
        setClinical([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Provide all data to consumers
  const value = {
    ouraSpark,
    oura,
    withings,
    runningSpark,
    running,
    clinicalSpark,
    clinical,
    isLoading,
    error
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};