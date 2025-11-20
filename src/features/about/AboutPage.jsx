// src/features/about/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/ui/Layout';
import Markdown from '../../components/ui/Markdown';
import ErrorBoundary from '../../components/ErrorBoundary';
import CareerTimeline from './components/CareerTimeline';
import Search from '../search/Search';
import { useSearch } from '../../hooks/useSearch';
import { API_ENDPOINTS, ERROR_MESSAGES, DEFAULT_MESSAGES } from '../../constants';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import StatusMessage from '../../components/ui/StatusMessage';

const AboutPage = () => {
  const [homeContent, setHomeContent] = useState('');
  const [schoolContent, setSchoolContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchActive, toggleSearch] = useSearch();

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [homeResponse, schoolResponse] = await Promise.all([
          fetch(API_ENDPOINTS.ABOUT_CONTENT('home')),
          fetch(API_ENDPOINTS.ABOUT_CONTENT('school'))
        ]);

        if (!homeResponse.ok || !schoolResponse.ok) {
          throw new Error(ERROR_MESSAGES.CONTENT_LOAD_FAILED);
        }

        const [homeText, schoolText] = await Promise.all([
          homeResponse.text(),
          schoolResponse.text()
        ]);

        setHomeContent(homeText);
        setSchoolContent(schoolText);
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.CONTENT_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>
          <div className="space-y-12">
            {loading && <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_CONTENT} />}
            {error && !loading && <StatusMessage type="error" message={error} />}
            {!loading && !error && (
              <>
                <div>
                  <Markdown content={homeContent} />
                </div>
                
                <div>
                  <CareerTimeline />
                </div>

                <div>
                  <Markdown content={schoolContent} />
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default AboutPage;
