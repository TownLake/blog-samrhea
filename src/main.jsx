// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ThemeProvider from '/src/context/ThemeProvider.jsx';
import { ROUTES } from '/src/constants';
import '/src/index.css';

// Import page-level components from their new feature directories
import BlogIndexPage from '/src/features/blog/BlogIndexPage.jsx';
import PostPage from '/src/features/blog/PostPage.jsx';
import AboutPage from '/src/features/about/AboutPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Blog Routes */}
            <Route path={ROUTES.HOME} element={<BlogIndexPage />} />
            <Route path="/:filter" element={<BlogIndexPage />} /> 
            <Route path="/post/:slug" element={<PostPage />} />
            
            {/* About Route */}
            <Route path={ROUTES.ABOUT} element={<AboutPage />} />

            {/* Catch-all 404 Page */}
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
