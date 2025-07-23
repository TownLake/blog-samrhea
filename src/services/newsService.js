// src/services/newsService.js
/**
 * Fetches aggregated news and reading habit statistics.
 * This function assumes an API endpoint that provides a summary of news data.
 * @returns {Promise<Object>} A promise that resolves to the news statistics object.
 */
export const fetchNewsData = async () => {
  // This endpoint is hypothetical and should be implemented in your backend/API.
  // It's designed to return all the necessary data for the NewsPage in one call.
  const response = await fetch('/api/news-stats');

  if (!response.ok) {
    const errorInfo = await response.text();
    throw new Error(`Failed to fetch news data: ${response.status} ${response.statusText} - ${errorInfo}`);
  }

  return response.json();
};
