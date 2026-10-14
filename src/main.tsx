import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getInitialTheme, applyTheme } from './services/pwaVersionService';
import { ErrorBoundary } from './components/ErrorBoundary';

// Prevent third-party browser extensions (e.g. MetaMask / web3 extensions) from triggering unhandled runtime errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(typeof reason === 'string' ? reason : reason?.message || '');
    const stack = String(reason?.stack || '');
    if (
      msg.includes('MetaMask') ||
      msg.includes('ethereum') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });

  window.addEventListener('error', (event) => {
    const filename = String(event.filename || '');
    const message = String(event.message || '');
    const stack = String(event.error?.stack || '');
    if (
      filename.includes('chrome-extension://') ||
      filename.includes('moz-extension://') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://') ||
      message.includes('MetaMask') ||
      message.includes('ethereum')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

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

    // Listen for controllerchange to reload ONLY when an existing worker is superseded (never on initial install)
    let refreshing = false;
    const hadInitialController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadInitialController && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
