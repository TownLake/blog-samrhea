// src/About.jsx
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Markdown from './components/Markdown';
import ErrorBoundary from './components/ErrorBoundary';
import CareerTimeline from './components/CareerTimeline';
import FilterBar from './components/FilterBar';
import { isEmpty } from './utils/validation';
import Search from './components/Search';
import { useSearch } from './hooks/useSearch';
import { 
  ABOUT_SECTIONS, 
  API_ENDPOINTS, 
  ERROR_MESSAGES, 
  DEFAULT_MESSAGES,
  ROUTES,
  ANIMATION_TIMING
} from './constants';

/**
 * About page component with navigation and content
 */
const About = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const currentSection = pathParts[2] || 'home';

  // Cache content for better transitions
  const [contentCache, setContentCache] = useState({});

  // Custom search hook for toggling the search modal
  const [isSearchActive, toggleSearch] = useSearch();

  // Prefetch adjacent content
  useEffect(() => {
    if (currentSection === 'work') return;
    
    const prefetchAdjacentContent = async () => {
      const sectionIndex = ABOUT_SECTIONS.findIndex(s => s.id === currentSection);
      const adjacentSections = [];
      
      if (sectionIndex > 0) {
        adjacentSections.push(ABOUT_SECTIONS[sectionIndex - 1].id);
      }
      if (sectionIndex < ABOUT_SECTIONS.length - 1) {
        adjacentSections.push(ABOUT_SECTIONS[sectionIndex + 1].id);
      }
      
      for (const adjSection of adjacentSections) {
        if (adjSection === 'work') continue;
        if (!contentCache[adjSection]) {
          try {
            const response = await fetch(API_ENDPOINTS.ABOUT_CONTENT(adjSection));
            if (response.ok) {
              const text = await response.text();
              setContentCache(prev => ({
                ...prev,
                [adjSection]: text
              }));
            }
          } catch (error) {
            console.log(`Failed to prefetch ${adjSection}`);
          }
        }
      }
    };
    
    prefetchAdjacentContent();
  }, [currentSection, contentCache]);

  return (
    <>
      {/* Pass toggleSearch to Layout so that Navbar has the search button */}
      <Layout toggleSearch={toggleSearch}>
        <FilterBar 
          options={ABOUT_SECTIONS}
          currentOption={currentSection}
          useNavLink={true}
        />
        
        <Suspense fallback={<LoadingPlaceholder />}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.ABOUT_SECTION('home')} replace />} />
            <Route path=":section" element={<AboutSection contentCache={contentCache} setContentCache={setContentCache} />} />
            <Route path="*" element={<div>{DEFAULT_MESSAGES.SECTION_NOT_FOUND}</div>} />
          </Routes>
        </Suspense>
      </Layout>

      {/* Conditionally render the search overlay */}
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

// Loading placeholder for suspense fallback
const LoadingPlaceholder = () => (
  <div className="animate-pulse opacity-75">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
  </div>
);

// About section component for displaying content
const AboutSection = ({ contentCache, setContentCache }) => {
  const { section } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const prevSectionRef = React.useRef(section);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, ANIMATION_TIMING.LOADING_TIMEOUT);
    
    const loadContent = async () => {
      try {
        setLoading(true);
        setLoadingTimeout(false);
        
        if (prevSectionRef.current !== section) {
          prevSectionRef.current = section;
        }
        
        if (!isEmpty(contentCache[section])) {
          setContent(contentCache[section]);
          setLoading(false);
          clearTimeout(timer);
          return;
        }
        
        const response = await fetch(API_ENDPOINTS.ABOUT_CONTENT(section));
        if (!response.ok) throw new Error(ERROR_MESSAGES.CONTENT_LOAD_FAILED);
        const text = await response.text();
        
        setContentCache(prev => ({
          ...prev,
          [section]: text
        }));
        
        setContent(text);
      } catch (error) {
        console.error('Error loading content:', error);
        setContent(ERROR_MESSAGES.DEFAULT_EMPTY_CONTENT);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };
    
    loadContent();
    
    return () => clearTimeout(timer);
  }, [section, contentCache, setContentCache]);

  if (section === 'work') {
    return <CareerTimeline />;
  }
  
  return (
    <ErrorBoundary>
      <div className="mb-12">
        {loading && loadingTimeout ? (
          <div className="animate-pulse opacity-75">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
          </div>
        ) : (
          <Markdown content={content} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default About;
