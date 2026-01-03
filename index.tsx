import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from './App';
import ToastProvider from './src/components/ToastProvider';
import ErrorBoundary from './src/components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider />
      <App />
      <SpeedInsights />
    </ErrorBoundary>
  </React.StrictMode>
);