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
  ROUTES
} from './constants';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter } = useParams();

  const [posts, setPosts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Use the custom search hook
  const [isSearchActive, toggleSearch] = useSearch();

  // Set current page from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  // Set filter from URL params
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

  // Fetch posts using the extracted service
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPosts();
  }, []);

  // Filter posts based on current filter
  const filteredPosts = useMemo(() => {
    return filterPosts(posts, currentFilter);
  }, [posts, currentFilter]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // Handle filter change
  const handleFilterClick = (filter) => {
    if (filter === currentFilter) return;
    setCurrentPage(1);
    if (filter === 'All') {
      navigate(ROUTES.HOME);
    } else {
      navigate(ROUTES.FILTER(filter));
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    const validPage = clamp(page, 1, totalPages);
    if (validPage === page) {
      setCurrentPage(validPage);
      const basePath = currentFilter === 'All' ? ROUTES.HOME : ROUTES.FILTER(currentFilter);
      navigate(`${basePath}?page=${validPage}`);
    }
  };

  // Render error state
  if (error) {
    return (
      <Layout toggleSearch={toggleSearch}>
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          <p>Error loading posts. Please try again later.</p>
        </div>
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
          useNavLink={false}
        />

        <ErrorBoundary>
          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <p>{DEFAULT_MESSAGES.LOADING_POSTS}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <p>{DEFAULT_MESSAGES.NO_POSTS_FOUND}</p>
            </div>
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