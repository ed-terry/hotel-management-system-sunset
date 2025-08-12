import * as Sentry from '@sentry/react';

export const initSentry = () => {
    if (import.meta.env.VITE_ENABLE_SENTRY === 'true') {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            integrations: [
                Sentry.browserTracingIntegration(),
            ],
            environment: import.meta.env.MODE || 'production',
            release: import.meta.env.VITE_APP_VERSION || 'unknown',
            tracesSampleRate: 1.0,
            beforeSend(event) {
                // Don't send events in development
                if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
                    return null;
                }
                return event;
            },
        });
    }
};
