// src/components/data/NewsPage.jsx
import React, { useState, useMemo } from 'react';
import { Newspaper, BarChart3, Users, Clock, CalendarDays } from 'lucide-react'; // Added CalendarDays
import DataIntroCard from './DataIntroCard';
import Card from '../Card';
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';
import useNewsData from '../../hooks/useNewsData';
import { useTheme } from '../../context/ThemeContext';
import SimpleBarChart from '../charts/SimpleBarChart';
import ChartModal from '../modals/ChartModal';
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

// ArticlesBySourceCard, ArticlesByHourCard, RecentArticlesTable remain the same from previous response...
// For brevity, I'll omit them here but assume they are present and styled.

const ArticlesBySourceCard = ({ data, isDarkMode, onClick }) => (
  <Card onClick={onClick} className="p-5 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
      <Users className="w-5 h-5 mr-2" />
      <span className="text-sm">Top Sources</span>
    </div>
    {data && data.length > 0 ? (
      <>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white truncate" title={data[0].source}>{formatSourceName(data[0].source, 15)}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{data[0].count} articles (Top, last 30d)</div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click to see all top 10</p>
      </>
    ) : (
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">N/A</div>
    )}
  </Card>
);

const ArticlesByHourCard = ({ data, onClick }) => {
  const peak = useMemo(() => {
    if (!data || data.length === 0) return { hourLabel: 'N/A', count: 0 };
    return data.reduce((max, current) => (current.count > max.count ? current : max), data[0] || { hourLabel: 'N/A', count: 0 });
  }, [data]);

  return (
    <Card onClick={onClick} className="p-5 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
        <Clock className="w-5 h-5 mr-2" />
        <span className="text-sm">Peak Reading Time</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{peak.hourLabel}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{peak.count} articles (last 30d)</div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click for hourly breakdown</p>
    </Card>
  );
};

const RecentArticlesTable = ({ data }) => (
    <Card className="p-1 sm:p-4 mt-8">
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
  const [modalContent, setModalContent] = useState(null);

  const openModal = (title, chartType) => {
    setModalContent({ title, chartType });
  };
  const closeModal = () => {
    setModalContent(null);
  };

  const dailyAvg = useMemo(() => {
    if (!newsData.articlesByDay || newsData.articlesByDay.length === 0) return '0.0';
    const totalArticles = newsData.articlesByDay.reduce((sum, day) => sum + day.count, 0);
    const numberOfDaysWithData = newsData.articlesByDay.length > 0 ? newsData.articlesByDay.length : 1; // Avoid division by zero if no data for range
    return (totalArticles / numberOfDaysWithData).toFixed(1);
  }, [newsData.articlesByDay]);

  const topSourceData = useMemo(() => {
    if (!newsData.articlesBySource || newsData.articlesBySource.length === 0) return { name: 'N/A', count: 0 };
    return { name: newsData.articlesBySource[0].source, count: newsData.articlesBySource[0].count };
  }, [newsData.articlesBySource]);

  // Prepare full hourly data for chart (all 24 hours)
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

  const peakHourData = useMemo(() => {
    if (!fullHourlyData || fullHourlyData.length === 0) return { hourLabel: 'N/A', count: 0 };
    const peak = fullHourlyData.reduce((max, current) => (current.count > max.count ? current : max), fullHourlyData[0] || { hourLabel: 'N/A', count: 0 });
    return { hourLabel: peak.hourLabel, count: peak.count };
  }, [fullHourlyData]);


  // NEW: Calculate Busiest Day for summary card
  const busiestDayData = useMemo(() => {
    if (!newsData.articlesByDayOfWeek || newsData.articlesByDayOfWeek.length === 0) return { name: 'N/A', count: 0 };
    // API now provides { dayName, count } sorted by dayOfWeekNumeric
    const peak = newsData.articlesByDayOfWeek.reduce((max, current) => (current.count > max.count ? current : max), newsData.articlesByDayOfWeek[0] || { dayName: 'N/A', count: 0});
    return { name: peak.dayName, count: peak.count };
  }, [newsData.articlesByDayOfWeek]);

  return (
    <div className="py-2">
      <DataIntroCard title="News & Reading Habits" icon={Newspaper}>
        <p>An overview of the articles I'm reading, aggregated by day, source, and time of day. Plus, a list of my most recently read items.</p>
      </DataIntroCard>

      {isLoading && <LoadingIndicator message="Loading news data..." />}
      {error && <StatusMessage type="error" message="Failed to load news data." details={error} />}

      {!isLoading && !error && newsData && (
        <>
          {/* UPDATED: Summary Cards Grid to 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <Card onClick={() => openModal('Daily Reading Volume', 'dailyVolume')} className="p-5 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <BarChart3 className="w-5 h-5 mr-2" />
                <span className="text-sm">Daily Volume</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">{dailyAvg}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg articles/day (last 90d)</div>
            </Card>

            <ArticlesBySourceCard 
              data={newsData.articlesBySource} 
              isDarkMode={darkMode}
              onClick={() => openModal('Articles by Source (Top 10)', 'bySource')}
            />
            
            <ArticlesByHourCard 
              data={fullHourlyData} // Pass full hourly data
              isDarkMode={darkMode}
              onClick={() => openModal('Reading Times (by Hour)', 'byHour')}
            />
            
            {/* NEW: Day of the Week Summary Card */}
            <Card onClick={() => openModal('Reading by Day of Week', 'byDayOfWeek')} className="p-5 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <CalendarDays className="w-5 h-5 mr-2" />
                <span className="text-sm">Busiest Day</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">{busiestDayData.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{busiestDayData.count} articles (last 30d)</div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click for weekly breakdown</p>
            </Card>
          </div>

          <RecentArticlesTable data={newsData.recentArticles} />

          {modalContent && (
            <ChartModal isOpen={!!modalContent} onClose={closeModal} title={modalContent.title}>
              {modalContent.chartType === 'dailyVolume' && (
                <SimpleBarChart chartData={newsData.articlesByDay} xAxisDataKey="date" barDataKey="count" isDarkMode={darkMode} height={400} unit=" articles" xAxisTickFormatter={formatAxisDate} yAxisTickFormatter={(value) => Math.round(value)} />
              )}
              {modalContent.chartType === 'bySource' && (
                <SimpleBarChart chartData={newsData.articlesBySource.slice().reverse()} layout="vertical" xAxisDataKey="source" barDataKey="count" isDarkMode={darkMode} height={Math.max(300, newsData.articlesBySource.length * 40)} yAxisTickFormatter={(value) => formatSourceName(value, 30)} xAxisTickFormatter={(value) => Math.round(value)} yAxisWidth={180} barSize={20} />
              )}
              {modalContent.chartType === 'byHour' && (
                <SimpleBarChart chartData={fullHourlyData} layout="horizontal" xAxisDataKey="hourLabel" barDataKey="count" isDarkMode={darkMode} height={400} unit=" articles" xAxisTickFormatter={(value) => value.substring(0,2)} yAxisTickFormatter={(value) => Math.round(value)} />
              )}
              {/* NEW: Modal content for Day of Week Chart */}
              {modalContent.chartType === 'byDayOfWeek' && (
                <SimpleBarChart chartData={newsData.articlesByDayOfWeek} xAxisDataKey="dayName" barDataKey="count" isDarkMode={darkMode} height={400} unit=" articles" yAxisTickFormatter={(value) => Math.round(value)} />
              )}
            </ChartModal>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;