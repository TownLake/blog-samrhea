// src/features/blog/components/PostList.jsx
import React, { useMemo } from 'react';
import PostItem from './PostItem';
import { POSTS_PER_PAGE } from '../../../constants';
import { getYearMonth } from '../../../utils/formatters';

const PostList = ({ posts, currentPage, postsPerPage = POSTS_PER_PAGE }) => {
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
        const showYearMonth = thisYearMonth !== lastYearMonth;

        if (showYearMonth) {
          lastYearMonth = thisYearMonth;
        }

        return (
          <PostItem
            key={post.id}
            post={post}
            showYearMonth={showYearMonth}
          />
        );
      })}
    </ul>
  );
};

export default PostList;
