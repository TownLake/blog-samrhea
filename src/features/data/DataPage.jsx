// src/features/data/DataPage.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '/src/components/ui/Layout.jsx';
import ErrorBoundary from '/src/components/ErrorBoundary.jsx';
import { useSearch } from '/src/hooks/useSearch.js';
import Search from '/src/features/search/Search.jsx';
import LoadingIndicator from '/src/components/ui/LoadingIndicator.jsx';
import StatusMessage from '/src/components/ui/StatusMessage.jsx';
import { DEFAULT_MESSAGES, NAVIGATION_MAP } from '/src/constants';

// Lazily import page components from their new locations
const HealthDashboard = React.lazy(() => import('../health/HealthDashboard.jsx'));
const NewsPage = React.lazy(() => import('./news/NewsPage.jsx'));
const SupplementsPage = React.lazy(() => import('./supplements/SupplementsPage.jsx'));
const DigitalPage = React.lazy(() => import('./digital/DigitalPage.jsx'));

const DataPage = () => {
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
            <Routes>
              <Route path="/" element={<Navigate to={NAVIGATION_MAP.data.subnav[0].path} replace />} />
              <Route path="health" element={<HealthDashboard />} />
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