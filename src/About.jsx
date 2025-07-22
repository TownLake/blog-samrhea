// src/About.jsx
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Markdown from './components/Markdown';
import ErrorBoundary from './components/ErrorBoundary';
import CareerTimeline from './components/CareerTimeline';
import FloatingNav from './components/FloatingNav';
import { isEmpty } from './utils/validation';
import Search from './components/Search';
import { useSearch } from './hooks/useSearch';
import { ABOUT_SECTIONS, API_ENDPOINTS, ERROR_MESSAGES, DEFAULT_MESSAGES, ROUTES } from './constants';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

const About = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const currentSection = pathParts.length > 2 ? pathParts[2] : 'home';
  const [contentCache, setContentCache] = useState({});
  const [isSearchActive, toggleSearch] = useSearch();

  useEffect(() => {
    if (currentSection === 'work') return;
    const prefetchAdjacentContent = async () => {
      const sectionIndex = ABOUT_SECTIONS.findIndex(s => s.id === currentSection);
      const adjacentSections = [];
      if (sectionIndex > 0) adjacentSections.push(ABOUT_SECTIONS[sectionIndex - 1].id);
      if (sectionIndex < ABOUT_SECTIONS.length - 1) adjacentSections.push(ABOUT_SECTIONS[sectionIndex + 1].id);
      for (const adjSection of adjacentSections) {
        if (adjSection === 'work' || contentCache[adjSection]) continue;
        try {
          const response = await fetch(API_ENDPOINTS.ABOUT_CONTENT(adjSection));
          if (response.ok) {
            const text = await response.text();
            setContentCache(prev => ({ ...prev, [adjSection]: text }));
          }
        } catch (error) {
          console.log(`Failed to prefetch ${adjSection}`);
        }
      }
    };
    prefetchAdjacentContent();
  }, [currentSection, contentCache]);

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.ABOUT_SECTION('home')} replace />} />
            <Route path=":section" element={<AboutSection contentCache={contentCache} setContentCache={setContentCache} />} />
            <Route path="*" element={<StatusMessage type="error" message={DEFAULT_MESSAGES.SECTION_NOT_FOUND} />} />
          </Routes>
        </Suspense>
        <FloatingNav
          options={ABOUT_SECTIONS}
          currentOption={currentSection}
          useNavLink={true}
          basePath={ROUTES.ABOUT}
        />
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

// The AboutSection component remains unchanged
const AboutSection = ({ contentCache, setContentCache }) => {
  const { section } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ABOUT_SECTIONS.some(s => s.id === section)) {
      setError(DEFAULT_MESSAGES.SECTION_NOT_FOUND);
      setLoading(false);
      return;
    }
    if (section === 'work') {
      setLoading(false);
      setError(null);
      setContent('');
      return;
    }
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!isEmpty(contentCache[section])) {
          setContent(contentCache[section]);
        } else {
          const response = await fetch(API_ENDPOINTS.ABOUT_CONTENT(section));
          if (!response.ok) {
            throw new Error(response.status === 404 ? DEFAULT_MESSAGES.SECTION_NOT_FOUND : ERROR_MESSAGES.CONTENT_LOAD_FAILED);
          }
          const text = await response.text();
          setContentCache(prev => ({ ...prev, [section]: text }));
          setContent(text);
        }
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.CONTENT_LOAD_FAILED);
        setContent('');
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [section, contentCache, setContentCache]);

  if (section === 'work') return <CareerTimeline />;

  return (
    <ErrorBoundary>
      <div className="mb-12">
        {loading && <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}
        {error && !loading && <StatusMessage type="error" message={error} />}
        {!loading && !error && content && <Markdown content={content} />}
        {!loading && !error && !content && section !== 'work' && (
          <StatusMessage type="empty" message={ERROR_MESSAGES.DEFAULT_EMPTY_CONTENT} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default About;