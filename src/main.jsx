// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import About from './About.jsx';
import Post from './Post.jsx';
// import Health from './Health.jsx'; // REMOVED
import DataPage from './DataPage.jsx'; // ADDED
import ThemeProvider from './context/ThemeProvider.jsx';
import './index.css';
import { ROUTES } from './constants'; // Import ROUTES for consistency

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<App />} />
          {/* Route for blog filters e.g. /starred, /reading */}
          <Route path="/:filter" element={<App />} /> 
          
          <Route path={`${ROUTES.ABOUT}/*`} element={<About />} />
          <Route path="/post/:slug" element={<Post />} />
          
          {/* New Data Section Route */}
          <Route path={`${ROUTES.DATA}/*`} element={<DataPage />} />

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
  </React.StrictMode>,
);