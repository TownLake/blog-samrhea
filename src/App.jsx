// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Layout from './components/Layout';
import PostList from './components/PostList';
import Pagination from './components/Pagination';
import ErrorBoundary from './components/ErrorBoundary';
import Search from './components/Search';
import { useSearch } from './hooks/useSearch';
import { clamp } from './utils/validation';
import { fetchPosts, filterPosts } from './services/postService';
import { POSTS_PER_PAGE, DEFAULT_MESSAGES, ERROR_MESSAGES, NAVIGATION_MAP } from './constants';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filter } = useParams();

  const [currentFilter, setCurrentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, toggleSearch] = useSearch();

  // Fetch posts data using React Query
  const { data: posts = [], isLoading, isError, error } = useQuery('posts', fetchPosts);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const validFilters = NAVIGATION_MAP.blog.subnav.map(f => f.id);
    if (filter && validFilters.some(f => f.toLowerCase() === filter.toLowerCase())) {
        const matchedFilter = validFilters.find(f => f.toLowerCase() === filter.toLowerCase());
        setCurrentFilter(matchedFilter);
    } else {
        setCurrentFilter('All');
    }
  }, [filter]);

  const filteredPosts = useMemo(() => filterPosts(posts, currentFilter), [posts, currentFilter]);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const goToPage = (page) => {
    const validPage = clamp(page, 1, totalPages);
    const basePath = currentFilter === 'All' ? '/' : `/${currentFilter.toLowerCase()}`;
    navigate(`${basePath}?page=${validPage}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POSTS} />;
    }
    if (isError) {
      return <StatusMessage type="error" message={ERROR_MESSAGES.LOAD_POSTS_FAILED} details={error.message} />;
    }
    const activeFilterLabel = NAVIGATION_MAP.blog.subnav.find(opt => opt.id === currentFilter)?.label;
    return (
      <>
        <h1 className="text-2xl font-semibold mb-6">{activeFilterLabel}</h1>
        {filteredPosts.length === 0 ? (
          <StatusMessage type="empty" message={DEFAULT_MESSAGES.NO_POSTS_FOUND} />
        ) : (
          <>
            <PostList posts={filteredPosts} currentPage={currentPage} postsPerPage={POSTS_PER_PAGE} />
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>{renderContent()}</ErrorBoundary>
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default App;
