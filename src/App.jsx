// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import FilterBar from './components/FilterBar';
import PostList from './components/PostList';
import Pagination from './components/Pagination';
import ErrorBoundary from './components/ErrorBoundary';
import Search from './components/Search';
import { useSearch } from './hooks/useSearch';
import { capitalizeFirstLetter } from './utils/formatters';
import { clamp } from './utils/validation';
import { fetchPosts, filterPosts } from './services/postService';
import {
  POSTS_PER_PAGE,
  FILTER_OPTIONS,
  DEFAULT_MESSAGES,
  ERROR_MESSAGES, // Import ERROR_MESSAGES
  ROUTES
} from './constants';
// Import new components
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter } = useParams();

  const [posts, setPosts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isSearchActive, toggleSearch] = useSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    if (filter) {
      const filterName = capitalizeFirstLetter(filter);
      if (FILTER_OPTIONS.some(option => option.id === filterName)) {
        setCurrentFilter(filterName);
      }
    } else {
      setCurrentFilter('All');
    }
  }, [filter]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPosts();
        setPosts(data);
      } catch (err) {
        // Use specific error message from constants
        setError(ERROR_MESSAGES.LOAD_POSTS_FAILED);
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return filterPosts(posts, currentFilter);
  }, [posts, currentFilter]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const handleFilterClick = (filterId) => {
    if (filterId === currentFilter) return;
    setCurrentPage(1);
    if (filterId === 'All') {
      navigate(ROUTES.HOME);
    } else {
      navigate(ROUTES.FILTER(filterId)); // Use filterId which matches constant
    }
  };

  const goToPage = (page) => {
    const validPage = clamp(page, 1, totalPages);
    // No need to check validPage === page, navigate will handle it
    setCurrentPage(validPage);
    const basePath = currentFilter === 'All' ? ROUTES.HOME : ROUTES.FILTER(currentFilter);
    navigate(`${basePath}?page=${validPage}`);

  };

  // Render error state using StatusMessage
  if (error && !loading) { // Show error only if not loading anymore
    return (
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={FILTER_OPTIONS}
          currentOption={currentFilter}
          onOptionClick={handleFilterClick}
          useNavLink={false} // Ensure this remains false for App.jsx
        />
        <StatusMessage type="error" message={error} details="Please try refreshing the page."/>
      </Layout>
    );
  }

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={FILTER_OPTIONS}
          currentOption={currentFilter}
          onOptionClick={handleFilterClick}
          useNavLink={false} // Ensure this remains false for App.jsx
        />

        <ErrorBoundary>
           {/* Use LoadingIndicator */}
          {loading ? (
            <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POSTS} />
          ) : filteredPosts.length === 0 ? (
            // Use StatusMessage for empty state
            <StatusMessage type="empty" message={DEFAULT_MESSAGES.NO_POSTS_FOUND} />
          ) : (
            <>
              <PostList
                posts={filteredPosts}
                currentPage={currentPage}
                postsPerPage={POSTS_PER_PAGE}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </Layout>

      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default App;