import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DebugPanel from './components/DebugPanel';
import AppLoadingScreen from './components/AppLoadingScreen';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { logger } from './utils/logger';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize application logging
    logger.info('Sunset Hotel Management System started', {
      component: 'App',
      action: 'initialization',
      metadata: {
        version: '1.0.0',
        environment: import.meta.env.MODE,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    });

    // Set global app context for all logs
    logger.setContext({
      sessionId: Math.random().toString(36).substring(2, 15),
      component: 'App',
    });

    // Simulate app initialization time
    const initTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(initTimer);
      logger.info('Sunset Hotel Management System shutting down', {
        component: 'App',
        action: 'cleanup',
      });
    };
  }, []);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <ErrorBoundary context={{ component: 'App', action: 'render' }}>
      <AuthProvider>
        <SettingsProvider>
          <ProtectedRoute>
            <div className="min-h-screen bg-base-100">
              <Navbar />
              <Outlet />
              <DebugPanel />
            </div>
          </ProtectedRoute>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;