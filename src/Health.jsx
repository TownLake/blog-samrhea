// src/Health.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/health/Dashboard';
import { HealthDataProvider } from './store/HealthDataContext';
import { useSearch } from './hooks/useSearch';

const Health = () => {
  // Use the custom search hook consistent with other pages
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <HealthDataProvider>
      <Layout toggleSearch={toggleSearch}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Add additional health routes here if needed */}
        </Routes>
      </Layout>
      
      {/* Reuse the blog's search component */}
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </HealthDataProvider>
  );
};

export default Health;