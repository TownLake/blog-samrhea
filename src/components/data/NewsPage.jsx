// src/components/data/NewsPage.jsx
import React, { useState, useMemo } from 'react';
import { Newspaper, BarChart3, Users, Clock } from 'lucide-react'; // Added more icons
import DataIntroCard from './DataIntroCard';
import Card from '../Card'; // Main card for summaries
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';
import useNewsData from '../../hooks/useNewsData';
import { useTheme } from '../../context/ThemeContext';
import SimpleBarChart from '../charts/SimpleBarChart';
import ChartModal from '../modals/ChartModal'; // Import the new modal
import { formatDate } from '../../utils/formatters';

// Helper to format date for X-axis ticks (e.g., "May 30")
const formatAxisDate = (dateString) => {
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) { return dateString; }
};

const formatSourceName = (name, maxLength = 20) => {
  if (!name) return '';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

// The table component remains mostly the same
const RecentArticlesTable = ({ data }) => (
    <Card className="p-1 sm:p-4 mt-8"> {/* Added mt-8 for spacing */}
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
  const [modalContent, setModalContent] = useState(null); // { title: string, chartType: string }

  const openModal = (title, chartType) => {
    setModalContent({ title, chartType });
  };
  const closeModal = () => {
    setModalContent(null);
  };

  // Calculate summary statistics
  const dailyAvg = useMemo(() => {
    if (!newsData.articlesByDay || newsData.articlesByDay.length === 0) return 0;
    const totalArticles = newsData.articlesByDay.reduce((sum, day) => sum + day.count, 0);
    return (totalArticles / newsData.articlesByDay.length).toFixed(1);
  }, [newsData.articlesByDay]);

  const topSource = useMemo(() => {
    if (!newsData.articlesBySource || newsData.articlesBySource.length === 0) return { name: 'N/A', count: 0 };
    return { name: newsData.articlesBySource[0].source, count: newsData.articlesBySource[0].count };
  }, [newsData.articlesBySource]);

  const peakHourData = useMemo(() => {
    if (!newsData.articlesByHour || newsData.articlesByHour.length === 0) return { hour: 'N/A', count: 0 };
    // API already sorts by hour, but we need to find the max count
    const peak = newsData.articlesByHour.reduce((max, current) => (current.count > max.count ? current : max), newsData.articlesByHour[0]);
    return { hour: `${String(peak.hour).padStart(2, '0')}:00`, count: peak.count };
  }, [newsData.articlesByHour]);
  
  // Prepare data for hourly chart (all 24 hours)
  const fullHourlyData = useMemo(() => {
    if (!newsData.articlesByHour) return [];
    return Array.from({ length: 24 }, (_, i) => {
      const hourData = newsData.articlesByHour.find(h => h.hour === i);
      return {
        hour: i,
        hourLabel: `${String(i).padStart(2, '0')}:00`,
        count: hourData ? hourData.count : 0,
      };
    });
  }, [newsData.articlesByHour]);


  return (
    <div className="py-2">
      <DataIntroCard title="News & Reading Habits" icon={Newspaper}>
        <p>An overview of the articles I'm reading, aggregated by day, source, and time of day. Plus, a list of my most recently read items.</p>
      </DataIntroCard>

      {isLoading && <LoadingIndicator message="Loading news data..." />}
      {error && <StatusMessage type="error" message="Failed to load news data." details={error} />}

      {!isLoading && !error && newsData && (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card onClick={() => openModal('Daily Reading Volume', 'dailyVolume')} className="p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <BarChart3 className="w-5 h-5 mr-2" />
                <span className="text-sm">Daily Volume</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">{dailyAvg}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg articles/day (last 90d)</div>
            </Card>

            <Card onClick={() => openModal('Articles by Source (Top 10)', 'bySource')} className="p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <Users className="w-5 h-5 mr-2" />
                <span className="text-sm">Top Source</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white truncate" title={topSource.name}>{formatSourceName(topSource.name, 15)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{topSource.count} articles (last 30d)</div>
            </Card>

            <Card onClick={() => openModal('Reading Times (by Hour)', 'byHour')} className="p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm">Peak Reading Time</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">{peakHourData.hour}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{peakHourData.count} articles (last 30d)</div>
            </Card>
          </div>

          <RecentArticlesTable data={newsData.recentArticles} />

          {/* Modal for Detailed Charts */}
          {modalContent && (
            <ChartModal isOpen={!!modalContent} onClose={closeModal} title={modalContent.title}>
              {modalContent.chartType === 'dailyVolume' && (
                <SimpleBarChart
                    chartData={newsData.articlesByDay}
                    xAxisDataKey="date"
                    barDataKey="count"
                    isDarkMode={darkMode}
                    height={400} // Taller chart for modal
                    unit=" articles"
                    xAxisTickFormatter={formatAxisDate}
                    yAxisTickFormatter={(value) => Math.round(value)}
                />
              )}
              {modalContent.chartType === 'bySource' && (
                <SimpleBarChart
                    chartData={newsData.articlesBySource.slice().reverse()}
                    layout="vertical"
                    xAxisDataKey="source"
                    barDataKey="count"
                    isDarkMode={darkMode}
                    height={500} // Taller for more sources
                    unit=" articles"
                    yAxisTickFormatter={(value) => formatSourceName(value, 30)} // Allow longer names in modal
                    xAxisTickFormatter={(value) => Math.round(value)}
                    yAxisWidth={180}
                    barSize={20}
                />
              )}
              {modalContent.chartType === 'byHour' && (
                <SimpleBarChart
                    chartData={fullHourlyData}
                    layout="horizontal"
                    xAxisDataKey="hourLabel"
                    barDataKey="count"
                    isDarkMode={darkMode}
                    height={400}
                    unit=" articles"
                    xAxisTickFormatter={(value) => value.substring(0,2)}
                    yAxisTickFormatter={(value) => Math.round(value)}
                />
              )}
            </ChartModal>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;