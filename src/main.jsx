// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import About from './About.jsx';
import Post from './Post.jsx';
import Health from './Health.jsx';
import ThemeProvider from './context/ThemeProvider.jsx'; // Import the ThemeProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire application with ThemeProvider */}
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:filter" element={<App />} />
          <Route path="/about/*" element={<About />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/health/*" element={<Health />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="mb-6">Page not found</p>
                <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Return Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);