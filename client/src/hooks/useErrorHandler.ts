import { useCallback } from 'react';
import { logger, LogContext } from '../utils/logger';

/**
 * Modern error handling hook for functional components
 */
export const useErrorHandler = () => {
    const reportError = useCallback((error: Error, context?: LogContext) => {
        logger.error('Manual error report', error, {
            ...context,
            component: context?.component || 'useErrorHandler',
            action: 'manualReport',
        });
    }, []);

    const reportWarning = useCallback((message: string, context?: LogContext) => {
        logger.warn(message, {
            ...context,
            component: context?.component || 'useErrorHandler',
            action: 'warning',
        });
    }, []);

    const reportInfo = useCallback((message: string, context?: LogContext) => {
        logger.info(message, {
            ...context,
            component: context?.component || 'useErrorHandler',
            action: 'info',
        });
    }, []);

    return {
        reportError,
        reportWarning,
        reportInfo,
    };
};
