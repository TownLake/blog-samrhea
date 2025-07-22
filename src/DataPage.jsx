// src/DataPage.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { HealthDataProvider } from './store/HealthDataContext';
import { useSearch } from './hooks/useSearch';
import Search from './components/Search';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';
import { DEFAULT_MESSAGES, NAVIGATION_MAP } from './constants';

const HealthDashboard = React.lazy(() => import('./components/data/health/Dashboard.jsx'));
const NewsPage = React.lazy(() => import('./components/data/NewsPage'));
const SupplementsPage = React.lazy(() => import('./components/data/SupplementsPage'));
const DigitalPage = React.lazy(() => import('./components/data/DigitalPage'));

const DataPage = () => {
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
            <Routes>
              <Route path="/" element={<Navigate to={NAVIGATION_MAP.data.subnav[0].path} replace />} />
              <Route path="health" element={<HealthDataProvider><HealthDashboard /></HealthDataProvider>} />
              <Route path="news" element={<NewsPage />} />
              <Route path="supplements" element={<SupplementsPage />} />
              <Route path="digital" element={<DigitalPage />} />
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