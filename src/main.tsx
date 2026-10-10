import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getInitialTheme, applyTheme } from './services/pwaVersionService';

// 1. Immediately apply the default theme (dark mode by default)
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

// 2. Register Service Worker with GitHub Pages relative path support & update notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Relative path ./sw.js supports custom domains, subpaths, and GitHub Pages
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((registration) => {
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, dispatch event to show banner
                window.dispatchEvent(new CustomEvent('florahearth-sw-update-available'));
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Service worker registration error:', err);
      });

    // Listen for controllerchange to reload if skipWaiting is triggered
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
