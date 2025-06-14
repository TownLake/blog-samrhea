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
  const [otherData, setOtherData] = useState([]);
  const [otherDataSpark, setOtherDataSpark] = useState([]);
  const [macros, setMacros] = useState([]); // NEW state for macros
  const [macrosSpark, setMacrosSpark] = useState([]); // NEW state for macros sparklines
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
        setOtherData(data.otherData || []);
        setOtherDataSpark(data.otherDataSpark || []);
        setMacros(data.macros || []);             // Set new data
        setMacrosSpark(data.macrosSpark || []);   // Set new sparkline data

      } catch (err) { // This catch might be for errors not caught within fetchHealthData
        console.error('Error loading health data in context:', err);
        setError(err.message || 'Failed to load health data');
        
        // Set empty arrays on error
        setOuraSpark([]); setOura([]); setWithings([]);
        setRunningSpark([]); setRunning([]);
        setClinicalSpark([]); setClinical([]);
        setOtherData([]); setOtherDataSpark([]);
        setMacros([]); setMacrosSpark([]); // Also clear new data on error
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
    otherData,
    otherDataSpark,
    macros,         // Provide new data
    macrosSpark,    // Provide new sparkline data
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