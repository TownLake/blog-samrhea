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
  ERROR_MESSAGES,
  ROUTES
} from './constants';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter } = useParams(); // Gets the filter part from the URL (e.g., 'starred')

  const [posts, setPosts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All'); // Internal state tracking the filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isSearchActive, toggleSearch] = useSearch();

  // Effect to sync current page state with URL query parameter ?page=...
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  // Effect to sync current filter state with URL path parameter /:filter
  useEffect(() => {
    if (filter) { // If there's a filter in the URL path (e.g., /starred)
      const filterName = capitalizeFirstLetter(filter); // e.g., 'starred' -> 'Starred'
      // Check if the capitalized filter name matches one of our defined options
      if (FILTER_OPTIONS.some(option => option.id === filterName)) {
        setCurrentFilter(filterName); // Update the internal state
      } else {
         // Optional: Handle invalid filter in URL, maybe redirect to 404 or home
         // For now, default to 'All' if the URL filter isn't valid
         setCurrentFilter('All');
         // navigate(ROUTES.HOME); // Or navigate home explicitly
      }
    } else { // If there's no filter in the URL path (e.g., /)
      setCurrentFilter('All'); // Set internal state to 'All'
    }
  }, [filter]); // Rerun this effect only when the `filter` URL parameter changes

  // Effect to load posts on initial component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPosts();
        setPosts(data);
      } catch (err) {
        setError(ERROR_MESSAGES.LOAD_POSTS_FAILED);
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []); // Empty dependency array means this runs only once on mount

  // Memoize filtered posts to avoid recalculating on every render
  const filteredPosts = useMemo(() => {
    return filterPosts(posts, currentFilter);
  }, [posts, currentFilter]); // Recalculate only if posts or currentFilter changes

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // --- MODIFIED FUNCTION ---
  const handleFilterClick = (filterId) => {
    // Always reset to page 1 when changing filters or deselecting
    setCurrentPage(1);

    // Check if the clicked filter is the same as the currently active one
    if (filterId === currentFilter) {
      // If yes, DESELECT the filter by navigating to the home route (which corresponds to 'All')
      navigate(ROUTES.HOME);
    // Check if the clicked filter is specifically 'All' (might not be needed if 'All' isn't a button, but good practice)
    } else if (filterId === 'All') {
        navigate(ROUTES.HOME);
    // Otherwise, a new, different filter is clicked
    } else {
      // SELECT the new filter by navigating to its specific route
      navigate(ROUTES.FILTER(filterId)); // e.g., /starred
    }
    // IMPORTANT: We don't need setCurrentFilter(filterId) here directly.
    // The navigation change triggers the `useEffect` hook listening to `useParams().filter`.
    // That effect will then update the `currentFilter` state based on the new URL.
    // This keeps the URL as the single source of truth for the active filter.
  };
  // --- END OF MODIFIED FUNCTION ---

  const goToPage = (page) => {
    const validPage = clamp(page, 1, totalPages);
    setCurrentPage(validPage); // Update internal page state
    // Construct the base path based on the current filter (from state, which is synced with URL)
    const basePath = currentFilter === 'All' ? ROUTES.HOME : ROUTES.FILTER(currentFilter);
    // Navigate to the correct path including the page query parameter
    navigate(`${basePath}?page=${validPage}`);
  };

  // Render error state
  if (error && !loading) {
    return (
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={FILTER_OPTIONS}
          currentOption={currentFilter}
          onOptionClick={handleFilterClick}
          useNavLink={false}
        />
        <StatusMessage type="error" message={error} details="Please try refreshing the page."/>
      </Layout>
    );
  }

  // Main render logic
  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <FilterBar
          options={FILTER_OPTIONS}
          currentOption={currentFilter} // Pass the state variable
          onOptionClick={handleFilterClick} // Pass the handler function
          useNavLink={false} // Keep this false as App controls navigation
        />

        <ErrorBoundary>
          {loading ? (
            <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POSTS} />
          ) : filteredPosts.length === 0 ? (
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