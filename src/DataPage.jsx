// src/DataPage.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingNav from './components/FloatingNav';
import { HealthDataProvider } from './store/HealthDataContext';
import { useSearch } from './hooks/useSearch';
import Search from './components/Search';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';
import { DATA_SECTIONS, ROUTES, DEFAULT_MESSAGES } from './constants';

const HealthDashboard = React.lazy(() => import('./components/data/health/Dashboard.jsx'));
const NewsPage = React.lazy(() => import('./components/data/NewsPage'));
const SupplementsPage = React.lazy(() => import('./components/data/SupplementsPage'));
const DigitalPage = React.lazy(() => import('./components/data/DigitalPage'));

const DataPage = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const currentSection = pathParts[2] && DATA_SECTIONS.some(s => s.id === pathParts[2]) ? pathParts[2] : 'health';
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
            <Routes>
              <Route path="/" element={<Navigate to={ROUTES.DATA_HEALTH} replace />} />
              <Route path="health" element={<HealthDataProvider><HealthDashboard /></HealthDataProvider>} />
              <Route path="news" element={<NewsPage />} />
              <Route path="supplements" element={<SupplementsPage />} />
              <Route path="digital" element={<DigitalPage />} />
              <Route path="*" element={<StatusMessage type="error" message={DEFAULT_MESSAGES.SECTION_NOT_FOUND} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <FloatingNav
          options={DATA_SECTIONS}
          currentOption={currentSection}
          useNavLink={true}
          basePath={ROUTES.DATA}
        />
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default DataPage;