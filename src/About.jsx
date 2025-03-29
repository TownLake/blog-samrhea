// src/About.jsx
import React, { Suspense, useState, useEffect, useRef } from 'react'; // Added useRef
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
// Import new components
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

/**
 * About page component with navigation and content
 */
const About = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const currentSection = pathParts.length > 2 ? pathParts[2] : 'home'; // Ensure default section if path is just /about

  const [contentCache, setContentCache] = useState({});
  const [isSearchActive, toggleSearch] = useSearch();

  // Prefetch adjacent content (remains the same)
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
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={ABOUT_SECTIONS}
          currentOption={currentSection}
          useNavLink={true}
        />

         {/* Use LoadingIndicator for Suspense fallback */}
        <Suspense fallback={<LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}>
          <Routes>
            {/* Redirect /about to /about/home */}
            <Route path="/" element={<Navigate to={ROUTES.ABOUT_SECTION('home')} replace />} />
            <Route path=":section" element={<AboutSection contentCache={contentCache} setContentCache={setContentCache} />} />
             {/* Catch-all for invalid sections within /about */}
            <Route path="*" element={<StatusMessage type="error" message={DEFAULT_MESSAGES.SECTION_NOT_FOUND} />} />
          </Routes>
        </Suspense>
      </Layout>

      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

// --- Removed LoadingPlaceholder component ---
// const LoadingPlaceholder = () => ( ... );

// About section component for displaying content
const AboutSection = ({ contentCache, setContentCache }) => {
  const { section } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  // Removed loadingTimeout state
  const prevSectionRef = useRef(section); // Use ref instead of state for previous section

  useEffect(() => {
     // Ensure section exists in our defined sections
     if (!ABOUT_SECTIONS.some(s => s.id === section) && section !== 'work') {
        setError(DEFAULT_MESSAGES.SECTION_NOT_FOUND);
        setContent('');
        setLoading(false);
        return;
     }

    // Skip loading for 'work' section as it uses CareerTimeline component
    if (section === 'work') {
        setLoading(false);
        setError(null);
        setContent(''); // Clear any previous content
        return;
    }


    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Check cache first
        if (!isEmpty(contentCache[section])) {
          setContent(contentCache[section]);
          setLoading(false);
          return;
        }

        // Fetch content
        const response = await fetch(API_ENDPOINTS.ABOUT_CONTENT(section));
        if (!response.ok) {
             // Handle specific not found errors from fetch if possible
            if (response.status === 404) {
                throw new Error(DEFAULT_MESSAGES.SECTION_NOT_FOUND);
            } else {
                throw new Error(ERROR_MESSAGES.CONTENT_LOAD_FAILED);
            }
        }
        const text = await response.text();

        setContentCache(prev => ({
          ...prev,
          [section]: text
        }));

        setContent(text);
      } catch (err) {
        console.error(`Error loading content for section ${section}:`, err);
        setError(err.message || ERROR_MESSAGES.CONTENT_LOAD_FAILED);
        setContent(''); // Clear content on error
      } finally {
        setLoading(false);
      }
    };

    loadContent();

  }, [section, contentCache, setContentCache]);

  // Render CareerTimeline directly for the 'work' section
  if (section === 'work') {
    return <CareerTimeline />;
  }

  return (
    <ErrorBoundary>
      <div className="mb-12">
         {/* Use LoadingIndicator */}
        {loading && <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}

         {/* Use StatusMessage for errors */}
        {error && !loading && <StatusMessage type="error" message={error} />}

        {/* Render Markdown content when not loading and no error */}
        {!loading && !error && content && <Markdown content={content} />}

        {/* Handle case where content might be empty but no error (e.g., empty file) */}
        {!loading && !error && !content && section !== 'work' && (
            <StatusMessage type="empty" message={ERROR_MESSAGES.DEFAULT_EMPTY_CONTENT} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default About;