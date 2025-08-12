import React from 'react';
import { logger, LogContext } from '../utils/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  context?: LogContext;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId?: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true, 
      error,
      errorId: Math.random().toString(36).substring(2, 15)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Modern error logging with structured context
    logger.error(
      'React Error Boundary caught an error',
      error,
      {
        ...this.props.context,
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        metadata: {
          componentStack: errorInfo.componentStack,
          reactVersion: React.version,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          errorBoundary: this.constructor.name,
        },
      }
    );

    // Handle specific error types
    if (error.name === 'ChunkLoadError') {
      logger.warn('Chunk load error detected - possible new deployment', {
        component: 'ErrorBoundary',
        action: 'chunkLoadError',
      });
    }
    
    console.error('Error caught by boundary:', { error, errorInfo });
  }

  handleRetry = () => {
    logger.info('User attempted error recovery', {
      component: 'ErrorBoundary',
      action: 'retry',
      metadata: { errorId: this.state.errorId },
    });
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = () => {
    if (this.state.error) {
      logger.error('User reported error', this.state.error, {
        component: 'ErrorBoundary',
        action: 'report',
        metadata: {
          errorId: this.state.errorId,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Simple feedback for now
      alert('Error reported successfully. Thank you for helping us improve!');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
          <div className="bg-base-200 rounded-lg p-8 max-w-lg w-full text-center border border-base-300">
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-base-content/70 mb-6">
              We've encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {this.state.errorId && (
              <p className="text-xs text-base-content/50 mb-4">
                Error ID: {this.state.errorId}
              </p>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-content font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="w-full border border-base-300 hover:border-base-content/20 text-base-content font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReportError}
                className="w-full bg-warning hover:bg-warning/90 text-warning-content font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Report Issue
              </button>
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 text-left p-4 bg-base-300 rounded-md overflow-auto">
                  <p className="text-error font-mono text-sm whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="mt-2 text-base-content/70 font-mono text-sm whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
