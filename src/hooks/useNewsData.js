// src/hooks/useNewsData.js
import { useState, useEffect } from 'react';

const useNewsData = (days = 90, sourceDays = 30) => {
  const [newsData, setNewsData] = useState({
    articlesByDay: [],
    articlesBySource: [],
    articlesByHour: [],
    articlesByDayOfWeek: [], // ADDED
    recentArticles: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/news?days=${days}&sourceDays=${sourceDays}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch news data: ${response.statusText}`);
        }
        const data = await response.json();
        // Ensure all expected arrays are initialized even if API doesn't return them
        setNewsData({
            articlesByDay: data.articlesByDay || [],
            articlesBySource: data.articlesBySource || [],
            articlesByHour: data.articlesByHour || [],
            articlesByDayOfWeek: data.articlesByDayOfWeek || [], // ADDED
            recentArticles: data.recentArticles || [],
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [days, sourceDays]);

  return { newsData, isLoading, error };
};

export default useNewsData;