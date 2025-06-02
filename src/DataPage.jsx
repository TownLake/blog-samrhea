// src/DataPage.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import FilterBar from './components/FilterBar';
import ErrorBoundary from './components/ErrorBoundary';
import { HealthDataProvider } from './store/HealthDataContext';
import { useSearch } from './hooks/useSearch';
import Search from './components/Search';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

import { DATA_SECTIONS, ROUTES, DEFAULT_MESSAGES } from './constants';

// Lazy load page components for better initial load time
const HealthDashboard = React.lazy(() => import('./components/data/HealthDashboard'));
const NewsPage = React.lazy(() => import('./components/data/NewsPage'));
const SupplementsPage = React.lazy(() => import('./components/data/SupplementsPage'));
const DigitalPage = React.lazy(() => import('./components/data/DigitalPage'));

const DataPage = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  // Default to 'health' if on /data, or extract section from /data/:section
  const currentSection = pathParts.length > 2 && DATA_SECTIONS.some(s => s.id === pathParts[2]) 
                         ? pathParts[2] 
                         : 'health';

  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={DATA_SECTIONS}
          currentOption={currentSection}
          useNavLink={true} // Use NavLink for direct navigation
        />
        <ErrorBoundary>
          <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
            <Routes>
              {/* Redirect /data to /data/health */}
              <Route path="/" element={<Navigate to={ROUTES.DATA_HEALTH} replace />} />
              
              <Route path="health" element={
                <HealthDataProvider>
                  <HealthDashboard />
                </HealthDataProvider>
              } />
              <Route path="news" element={<NewsPage />} />
              <Route path="supplements" element={<SupplementsPage />} />
              <Route path="digital" element={<DigitalPage />} />
              
              {/* Catch-all for invalid sections within /data */}
              <Route path="*" element={<StatusMessage type="error" message={DEFAULT_MESSAGES.SECTION_NOT_FOUND} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default DataPage;