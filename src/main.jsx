import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { RatingsProvider } from './context/RatingsContext';
import { installRipple } from './utils/ripple';
import './index.css';

installRipple();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RatingsProvider>
        <App />
      </RatingsProvider>
    </ErrorBoundary>
  </StrictMode>,
);
