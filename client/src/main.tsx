import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ToastContainer, toast } from 'react-toastify';
import { client } from './lib/apollo';
import { initSentry } from './lib/sentry';
import { router } from './routes';
import './index.css';

// Initialize Sentry
initSentry();

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              toast.info(
                'New version available! Please refresh the page to update.',
                {
                  autoClose: false,
                  closeButton: true,
                  closeOnClick: false,
                  draggable: false,
                  onClick: () => window.location.reload()
                }
              );
            }
          });
        }
      });
    } catch (error) {
      console.error('SW registration failed:', error);
      if (import.meta.env.DEV) {
        toast.error('Service Worker registration failed. Some offline features may not work.');
      }
    }
  }
}

registerServiceWorker();

import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ApolloProvider>
  </React.StrictMode>
);
