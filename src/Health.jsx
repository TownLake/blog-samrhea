// src/Health.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/health/Dashboard';
import { HealthDataProvider } from './store/HealthDataContext';
import { useSearch } from './hooks/useSearch';
import Search from './components/Search'; // *** ADDED: Import the Search component ***

const Health = () => {
  // Use the custom search hook consistent with other pages
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <HealthDataProvider>
      {/* Layout wraps the main page content */}
      <Layout toggleSearch={toggleSearch}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Add additional health routes here if needed inside Routes */}
        </Routes>
      </Layout>

      {/* Conditionally render Search component OUTSIDE the main Layout content flow */}
      {/* This ensures it overlays correctly */}
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </HealthDataProvider>
  );
};

export default Health;