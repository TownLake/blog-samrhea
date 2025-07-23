// src/features/blog/PostPage.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import Layout from '../../components/ui/Layout';
import Markdown from '../../components/ui/Markdown';
import ErrorBoundary from '../../components/ErrorBoundary';
import { getCategoryIcon, isStarred } from '../../utils/categoryIcons';
import { formatDate } from '../../utils/formatters';
import { fetchPost } from '../../services/postService';
import { DEFAULT_MESSAGES, ROUTES } from '../../constants';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import StatusMessage from '../../components/ui/StatusMessage';
import { useSearch } from '../../hooks/useSearch';
import Search from '../search/Search';

const PostPage = () => {
  const { slug } = useParams();
  const [copySuccess, setCopySuccess] = useState('');
  const [isSearchActive, toggleSearch] = useSearch();

  const { data: post, isLoading, isError, error } = useQuery(
    ['post', slug],
    () => fetchPost(slug),
    {
      staleTime: Infinity,
    }
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => console.error('Failed to copy URL: ', err));
  };

  if (isLoading) {
    return (
      <Layout toggleSearch={toggleSearch}>
        <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POST} />
      </Layout>
    );
  }

  if (isError || !post) {
    return (
      <Layout toggleSearch={toggleSearch}>
        <div className="py-10 text-center">
           <StatusMessage type="error" message={DEFAULT_MESSAGES.POST_NOT_FOUND_TITLE} details={error?.message || DEFAULT_MESSAGES.POST_NOT_FOUND_MESSAGE} />
           <Link to={ROUTES.HOME} className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Return Home
           </Link>
        </div>
         {isSearchActive && <Search toggleSearch={toggleSearch} />}
      </Layout>
    );
  }

  const categoryIcon = getCategoryIcon(post.category);
  const starred = isStarred(post);

  return (
    <Layout toggleSearch={toggleSearch}>
      <article className="mb-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
          {post.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{post.description}</p>
          )}
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <span>{formatDate(post.date)}</span>
            {post.category && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  {categoryIcon && <span className="mr-1">{categoryIcon}</span>}
                  <span>#{post.category}</span>
                </span>
              </>
            )}
            {starred && (
              <>
                <span className="mx-2">•</span>
                <span className="text-yellow-500">⭐</span>
              </>
            )}
          </div>
        </header>
        <ErrorBoundary>
          <div className="px-1">
            <Markdown content={post.content} />
          </div>
        </ErrorBoundary>
      </article>
      <div className="border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="flex justify-between items-center">
          <Link to={ROUTES.HOME} className="text-blue-500 hover:underline">
            ← Back to all posts
          </Link>
          <div className="flex space-x-4">
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center transition-all"
              onClick={copyToClipboard}
              aria-label="Copy link to this post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share {copySuccess && <span className="text-green-500 ml-2">{copySuccess}</span>}
            </button>
          </div>
        </div>
      </div>
       {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </Layout>
  );
};

export default PostPage;
