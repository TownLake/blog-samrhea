// src/components/data/NewsPage.jsx
import React from 'react';
import { Newspaper } from 'lucide-react';
import DataIntroCard from './DataIntroCard';
import Card from '../Card';
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';
import useNewsData from '../../hooks/useNewsData'; // Import the new hook
import { formatDate } from '../../utils/formatters'; // Assuming you have this

// Placeholder components for charts and table - we'll build these out
const ArticlesByDayChart = ({ data }) => (
  <Card className="p-4 h-80 flex items-center justify-center">
    <p className="text-gray-500">Articles Read by Day Chart (Data points: {data?.length || 0})</p>
    {/* Recharts BarChart will go here */}
  </Card>
);

const ArticlesBySourceCard = ({ data }) => (
  <Card className="p-4">
    <h3 className="text-lg font-semibold mb-2">Articles by Source</h3>
    <div className="h-72 flex items-center justify-center">
      <p className="text-gray-500">(Top sources: {data?.length || 0})</p>
    </div>
    {/* Recharts Horizontal BarChart or List will go here */}
  </Card>
);

const ArticlesByHourCard = ({ data }) => (
  <Card className="p-4">
    <h3 className="text-lg font-semibold mb-2">Reading Times</h3>
    <div className="h-72 flex items-center justify-center">
      <p className="text-gray-500">(Hourly distribution points: {data?.length || 0})</p>
    </div>
    {/* Recharts BarChart will go here */}
  </Card>
);

const RecentArticlesTable = ({ data }) => (
  <Card className="p-4 mt-6">
    <h3 className="text-lg font-semibold mb-3">Most Recent Reads</h3>
    {data && data.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Headline</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Read At</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((article) => (
              <tr key={article.link}>
                <td className="px-4 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white">
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {article.headline}
                  </a>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.source}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(article.clicked_at, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500">No recent articles to display.</p>
    )}
  </Card>
);


const NewsPage = () => {
  const { newsData, isLoading, error } = useNewsData(); // Use the hook

  return (
    <div className="py-2">
      <DataIntroCard title="News & Reading Habits" icon={Newspaper}>
        <p>An overview of the articles I'm reading, aggregated by day, source, and time of day. Plus, a list of my most recently read items.</p>
      </DataIntroCard>

      {isLoading && <LoadingIndicator message="Loading news data..." />}
      {error && <StatusMessage type="error" message="Failed to load news data." details={error} />}

      {!isLoading && !error && newsData && (
        <div className="mt-6 space-y-6">
          <div>
            {/* Main chart for articles read by day */}
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Daily Reading Volume</h2>
            <ArticlesByDayChart data={newsData.articlesByDay} />
          </div>

          {/* Grid for by source and by time of day cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ArticlesBySourceCard data={newsData.articlesBySource} />
            <ArticlesByHourCard data={newsData.articlesByHour} />
          </div>

          {/* Table for most recent articles */}
          <RecentArticlesTable data={newsData.recentArticles} />
        </div>
      )}
    </div>
  );
};

export default NewsPage;