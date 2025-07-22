// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import PostList from './components/PostList';
import Pagination from './components/Pagination';
import ErrorBoundary from './components/ErrorBoundary';
import Search from './components/Search';
import FloatingNav from './components/FloatingNav';
import { useSearch } from './hooks/useSearch';
import { capitalizeFirstLetter } from './utils/formatters';
import { clamp } from './utils/validation';
import { fetchPosts, filterPosts } from './services/postService';
import { POSTS_PER_PAGE, FILTER_OPTIONS, DEFAULT_MESSAGES, ERROR_MESSAGES, ROUTES } from './constants';
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';

const navOptions = [
  { id: 'All', label: 'All Posts', icon: '📝' },
  ...FILTER_OPTIONS
];

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
      if (navOptions.some(option => option.id === filterName)) {
        setCurrentFilter(filterName);
      } else {
        setCurrentFilter('All');
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
        setError(ERROR_MESSAGES.LOAD_POSTS_FAILED);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => filterPosts(posts, currentFilter), [posts, currentFilter]);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const activeFilter = navOptions.find(opt => opt.id === currentFilter) || navOptions[0];

  const handleFilterClick = (filterId) => {
    setCurrentPage(1);
    if (filterId === 'All') {
      navigate(ROUTES.HOME);
    } else {
      navigate(ROUTES.FILTER(filterId));
    }
  };

  const goToPage = (page) => {
    const validPage = clamp(page, 1, totalPages);
    const basePath = currentFilter === 'All' ? ROUTES.HOME : ROUTES.FILTER(currentFilter);
    navigate(`${basePath}?page=${validPage}`);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POSTS} />;
    }
    if (error) {
      return <StatusMessage type="error" message={error} details="Please try refreshing the page." />;
    }
    if (filteredPosts.length === 0) {
      return (
        <>
          <h1 className="text-2xl font-semibold mb-6">{activeFilter.label}</h1>
          <StatusMessage type="empty" message={DEFAULT_MESSAGES.NO_POSTS_FOUND} />
        </>
      );
    }
    return (
      <>
        <h1 className="text-2xl font-semibold mb-6">{activeFilter.label}</h1>
        <PostList posts={filteredPosts} currentPage={currentPage} postsPerPage={POSTS_PER_PAGE} />
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />
        )}
      </>
    );
  };

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>{renderContent()}</ErrorBoundary>
        <FloatingNav
          options={navOptions}
          currentOption={currentFilter}
          onOptionClick={handleFilterClick}
          useNavLink={false}
        />
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default App;