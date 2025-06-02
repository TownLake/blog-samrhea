// src/components/data/NewsPage.jsx
import React from 'react';
import { Newspaper } from 'lucide-react';
import DataIntroCard from './DataIntroCard';
import Card from '../Card';
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';
import useNewsData from '../../hooks/useNewsData';
import { useTheme } from '../../context/ThemeContext';
import SimpleBarChart from '../charts/SimpleBarChart';
import { formatDate } from '../../utils/formatters';

// Helper to format date for X-axis ticks (e.g., "May 30")
const formatAxisDate = (dateString) => {
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

// Helper to truncate long source names
const formatSourceName = (name, maxLength = 20) => {
  if (!name) return '';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

const ArticlesBySourceCard = ({ data, isDarkMode }) => (
  <Card className="p-4">
    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Articles by Source (Top 10)</h3>
    <SimpleBarChart
      chartData={data.slice().reverse()}
      layout="vertical"
      xAxisDataKey="source"
      barDataKey="count"
      isDarkMode={isDarkMode}
      height={400}
      unit=" articles"
      yAxisTickFormatter={(value) => formatSourceName(value, 25)}
      xAxisTickFormatter={(value) => Math.round(value)}
      yAxisWidth={150}
      barSize={15}
    />
  </Card>
);

const ArticlesByHourCard = ({ data, isDarkMode }) => {
    const fullHourlyData = Array.from({ length: 24 }, (_, i) => {
        const hourData = data.find(h => h.hour === i);
        return {
          hour: i,
          hourLabel: `${String(i).padStart(2, '0')}:00`,
          count: hourData ? hourData.count : 0,
        };
      });

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Reading Times (by Hour)</h3>
      <SimpleBarChart
        chartData={fullHourlyData}
        layout="horizontal"
        xAxisDataKey="hourLabel"
        barDataKey="count"
        isDarkMode={isDarkMode}
        height={400}
        unit=" articles"
        xAxisTickFormatter={(value) => value.substring(0,2)}
        yAxisTickFormatter={(value) => Math.round(value)}
      />
    </Card>
  );
};

const RecentArticlesTable = ({ data }) => (
  <Card className="p-1 sm:p-4 mt-6">
    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white px-3 sm:px-0">Most Recent Reads</h3>
    {data && data.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Headline</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Source</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Read At</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800/80 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((article) => (
              <tr key={article.link}>
                <td className="px-4 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white">
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {article.headline}
                  </a>
                  <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">{article.source}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{article.source}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {/* UPDATED aRTIFACT: Removed hour and minute from options */}
                  {formatDate(article.clicked_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500 px-3 sm:px-0">No recent articles to display.</p>
    )}
  </Card>
);


const NewsPage = () => {
  const { newsData, isLoading, error } = useNewsData();
  const { darkMode } = useTheme();

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
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Daily Reading Volume</h2>
            <Card className="p-2 sm:p-4">
                <SimpleBarChart
                    chartData={newsData.articlesByDay}
                    xAxisDataKey="date"
                    barDataKey="count"
                    isDarkMode={darkMode}
                    height={320}
                    unit=" articles"
                    xAxisTickFormatter={formatAxisDate}
                    yAxisTickFormatter={(value) => Math.round(value)}
                />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArticlesBySourceCard data={newsData.articlesBySource} isDarkMode={darkMode} />
            <ArticlesByHourCard data={newsData.articlesByHour} isDarkMode={darkMode} />
          </div>

          <RecentArticlesTable data={newsData.recentArticles} />
        </div>
      )}
    </div>
  );
};

export default NewsPage;