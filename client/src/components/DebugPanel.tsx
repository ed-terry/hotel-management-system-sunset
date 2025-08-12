import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');

  useEffect(() => {
    // Get current theme
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    setCurrentTheme(theme);

    // Update logs every second
    const interval = setInterval(() => {
      const latestLogs = logger.getLogs().slice(-10).reverse();
      setLogs(latestLogs);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    logger.info('Debug panel cleared logs', {
      component: 'DebugPanel',
      action: 'clearLogs',
    });
  };

  const exportLogs = () => {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const testError = () => {
    try {
      throw new Error('Test error for debugging');
    } catch (error) {
      logger.error('Test error triggered', error as Error, {
        component: 'DebugPanel',
        action: 'testError',
      });
    }
  };

  const getLogLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'text-base-content/50'; // DEBUG
      case 1: return 'text-info'; // INFO
      case 2: return 'text-warning'; // WARN
      case 3: return 'text-error'; // ERROR
      case 4: return 'text-error font-bold'; // FATAL
      default: return 'text-base-content';
    }
  };

  const getLogLevelName = (level: number) => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    return levels[level] || 'UNKNOWN';
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-neutral text-neutral-content p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-96 bg-base-200 border border-base-300 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-base-300 p-3 flex justify-between items-center">
            <h3 className="font-semibold text-base-content">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-base-content/70 hover:text-base-content"
            >
              ✕
            </button>
          </div>

          {/* Theme Info */}
          <div className="p-3 border-b border-base-300">
            <div className="text-sm">
              <span className="font-medium">Current Theme:</span>
              <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                {currentTheme}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <div className="w-4 h-4 bg-primary rounded" title="Primary"></div>
              <div className="w-4 h-4 bg-secondary rounded" title="Secondary"></div>
              <div className="w-4 h-4 bg-accent rounded" title="Accent"></div>
              <div className="w-4 h-4 bg-base-100 border border-base-300 rounded" title="Base-100"></div>
              <div className="w-4 h-4 bg-base-200 rounded" title="Base-200"></div>
              <div className="w-4 h-4 bg-base-300 rounded" title="Base-300"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-b border-base-300 flex gap-2">
            <button
              onClick={testError}
              className="btn btn-xs btn-error"
            >
              Test Error
            </button>
            <button
              onClick={clearLogs}
              className="btn btn-xs btn-warning"
            >
              Clear
            </button>
            <button
              onClick={exportLogs}
              className="btn btn-xs btn-primary"
            >
              Export
            </button>
          </div>

          {/* Logs */}
          <div className="p-3 overflow-y-auto max-h-48">
            <h4 className="font-medium text-sm mb-2">Recent Logs ({logs.length})</h4>
            {logs.length === 0 ? (
              <p className="text-base-content/50 text-xs">No logs yet...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs border-l-2 border-base-300 pl-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${getLogLevelColor(log.level)}`}>
                        {getLogLevelName(log.level)}
                      </span>
                      <span className="text-base-content/50">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-base-content/80">{log.message}</div>
                    {log.context?.component && (
                      <div className="text-base-content/50">
                        {log.context.component} / {log.context.action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
