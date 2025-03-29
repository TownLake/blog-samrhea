import React, { useMemo } from 'react';
import PostItem from './PostItem';
import { POSTS_PER_PAGE } from '../constants';

// A small helper to format a post date as "YYYY-MMM"
function getYearMonth(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  // Use { month: 'short' } to get “Jan”, “Feb”, “Mar”, etc.
  const monthShort = date.toLocaleString('default', { month: 'short' });
  return `${year}-${monthShort}`;
}

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
            // You could also pass down the exact label if you prefer
            showYearMonth={showYearMonth}
          />
        );
      })}
    </ul>
  );
};

export default PostList;
