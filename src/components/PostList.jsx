// src/components/PostList.jsx
import React, { useMemo } from 'react';
import PostItem from './PostItem';
import { POSTS_PER_PAGE } from '../constants';
import { getYearMonth } from '../utils/formatters'; // Import the utility function

// A small helper to format a post date as "YYYY-MMM"
// --- Removed local getYearMonth function ---
// function getYearMonth(dateString) { ... }

const PostList = ({ posts, currentPage, postsPerPage = POSTS_PER_PAGE }) => {
  // Get the current page's posts
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return posts.slice(startIndex, endIndex);
  }, [posts, currentPage, postsPerPage]);

  let lastYearMonth = '';

  return (
    <ul>
      {currentPosts.map((post) => {
        // Use the imported utility function
        const thisYearMonth = getYearMonth(post.date);
        // Show the YYYY-MMM only if it's different from the previous post
        const showYearMonth = thisYearMonth !== lastYearMonth;

        if (showYearMonth) {
          lastYearMonth = thisYearMonth;
        }

        return (
          <PostItem
            key={post.id}
            post={post}
            // Pass down whether or not to show the year-month
            showYearMonth={showYearMonth}
          />
        );
      })}
    </ul>
  );
};

export default PostList;