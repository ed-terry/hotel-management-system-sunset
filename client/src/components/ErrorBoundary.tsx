import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, BugAntIcon } from '@heroicons/react/24/outline';
import { logger, LogContext } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: LogContext;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId?: string;
  retryCount: number;
}

// Enhanced Error Boundary with better UI and error recovery
export default class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Enhanced error logging with more context
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
          retryCount: this.state.retryCount,
          errorId: this.state.errorId,
        },
      }
    );

    // Handle specific error types with better context
    if (error.name === 'ChunkLoadError') {
      logger.warn('Chunk load error detected - possible new deployment', {
        component: 'ErrorBoundary',
        action: 'chunkLoadError',
        metadata: { 
          suggestedAction: 'refresh_page',
          errorId: this.state.errorId,
        },
      });
    }
    
    console.error('Error caught by boundary:', { error, errorInfo });
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    logger.info('User attempted error recovery', {
      component: 'ErrorBoundary',
      action: 'retry',
      metadata: { 
        errorId: this.state.errorId,
        retryCount: newRetryCount,
        maxRetries: this.maxRetries,
      },
    });
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: newRetryCount,
    });
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-2xl p-8 max-w-lg w-full text-center border-2 border-amber-200/50 shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 font-medium">
                We've encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>
            
            {this.state.errorId && (
              <div className="bg-gray-100 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="w-full border-2 border-orange-300 hover:border-orange-400 text-orange-700 hover:bg-orange-50 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleReportError}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <BugAntIcon className="w-5 h-5" />
                Report Issue
              </button>
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 text-left p-4 bg-red-50 border-2 border-red-200 rounded-xl overflow-auto shadow-lg">
                  <p className="text-red-700 font-mono text-sm whitespace-pre-wrap font-bold">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="mt-2 text-red-600 font-mono text-sm whitespace-pre-wrap">
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
