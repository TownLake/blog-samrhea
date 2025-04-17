// src/store/HealthDataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchHealthData } from '../services/healthService';

const HealthDataContext = createContext();

export const HealthDataProvider = ({ children }) => {
  const [ouraSpark, setOuraSpark] = useState([]);
  const [oura, setOura] = useState([]);
  const [withings, setWithings] = useState([]);
  const [runningSpark, setRunningSpark] = useState([]);
  const [running, setRunning] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthData()
      .then(({ ouraSpark, oura, withings, runningSpark, running }) => {
        setOuraSpark(ouraSpark);
        setOura(oura);
        setWithings(withings);
        setRunningSpark(runningSpark);
        setRunning(running);
      })
      .catch(err => {
        console.error('Error loading health data:', err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <HealthDataContext.Provider value={{
      ouraSpark,
      oura,
      withings,
      runningSpark,
      running,
      isLoading,
      error
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => useContext(HealthDataContext);