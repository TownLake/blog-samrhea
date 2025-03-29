// src/Post.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Markdown from './components/Markdown';
import ErrorBoundary from './components/ErrorBoundary';
import { getCategoryIcon, isStarred } from './utils/categoryIcons';
import { formatDate } from './utils/formatters';
import { fetchPost } from './services/postService';
import {
  DEFAULT_MESSAGES,
  ERROR_MESSAGES, // Import ERROR_MESSAGES
  ROUTES
} from './constants';
// Import new components
import LoadingIndicator from './components/LoadingIndicator';
import StatusMessage from './components/StatusMessage';
import { useSearch } from './hooks/useSearch'; // Import useSearch

const Post = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isSearchActive, toggleSearch] = useSearch(); // Add search hook state

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const postData = await fetchPost(slug);
        setPost(postData);
      } catch (err) {
        console.error('Error loading post:', err);
        // Use specific error message if available, otherwise generic not found
        if (err.message === ERROR_MESSAGES.POST_NOT_FOUND || err.message === ERROR_MESSAGES.POST_CONTENT_NOT_FOUND) {
            setError(DEFAULT_MESSAGES.POST_NOT_FOUND_MESSAGE); // Set error for display
            // Optional: Still navigate for truly not found posts, or just show message
            // navigate(ROUTES.NOT_FOUND, { replace: true });
        } else {
            setError(ERROR_MESSAGES.CONTENT_LOAD_FAILED); // Generic load error
        }

      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  const copyToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  // Use LoadingIndicator
  if (loading) {
    return (
      // Pass toggleSearch to Layout
      <Layout toggleSearch={toggleSearch}>
        <LoadingIndicator message={DEFAULT_MESSAGES.LOADING_POST} />
      </Layout>
    );
  }

  // Use StatusMessage for error state
  if (error || !post) {
    return (
       // Pass toggleSearch to Layout
      <Layout toggleSearch={toggleSearch}>
        <div className="py-10 text-center">
            {/* Use StatusMessage centered or within a container */}
           <StatusMessage type="error" message={DEFAULT_MESSAGES.POST_NOT_FOUND_TITLE} details={error || DEFAULT_MESSAGES.POST_NOT_FOUND_MESSAGE} />
           <Link to={ROUTES.HOME} className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Return Home
           </Link>
        </div>
         {/* Render Search overlay if active */}
         {isSearchActive && <Search toggleSearch={toggleSearch} />}
      </Layout>
    );
  }

  // --- Post Display Logic (remains mostly the same) ---
  const categoryIcon = getCategoryIcon(post.category);
  const starred = isStarred(post);

  return (
    // Pass toggleSearch to Layout
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
       {/* Render Search overlay if active */}
       {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </Layout>
  );
};

export default Post;