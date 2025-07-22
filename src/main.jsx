// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query'; // Import react-query
import App from './App.jsx';
import About from './About.jsx';
import Post from './Post.jsx';
import DataPage from './DataPage.jsx';
import ThemeProvider from './context/ThemeProvider.jsx';
import './index.css';
import { ROUTES } from './constants';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provide the client to your App */}
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.HOME} element={<App />} />
            <Route path="/:filter" element={<App />} />
            <Route path={`${ROUTES.ABOUT}/*`} element={<About />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path={`${ROUTES.DATA}/*`} element={<DataPage />} />
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="text-center p-8">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="mb-6">Page not found</p>
                  <a href={ROUTES.HOME} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Return Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
