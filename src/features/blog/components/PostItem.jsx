// src/features/blog/components/PostItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getYearMonth } from '../../../utils/formatters';
import { isValidUrl } from '../../../utils/validation';

const PostItem = ({ post, showYearMonth }) => {
  const yearMonth = showYearMonth ? getYearMonth(post.date) : '';
  const isExternal = post.external || (post.url && isValidUrl(post.url));

  return (
    <li className="group">
      {isExternal ? (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex py-3 items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700">
            <div className="w-24 shrink-0 text-blue-500 dark:text-blue-400 text-sm">
              {yearMonth}
            </div>
            <div className="grow flex items-center text-sm">
              <span className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {post.title || "Untitled Post"}
              </span>
              <span className="ml-2 text-gray-500">↗</span>
            </div>
          </div>
        </a>
      ) : (
        <Link to={`/post/${post.id}`} className="block">
          <div className="flex py-3 items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700">
            <div className="w-24 shrink-0 text-blue-500 dark:text-blue-400 text-sm">
              {yearMonth}
            </div>
            <div className="grow flex items-center text-sm">
              <span className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {post.title || "Untitled Post"}
              </span>
            </div>
          </div>
        </Link>
      )}
    </li>
  );
};

export default PostItem;
