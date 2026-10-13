import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { App } from './App';
import './index.css';

// Automatically inject ngrok-skip-browser-warning header for all API & fetch requests
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

// Patch global window.fetch so every network request bypasses ngrok browser warning
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    if (!headers.has('ngrok-skip-browser-warning')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    return originalFetch(input, { ...init, headers });
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
