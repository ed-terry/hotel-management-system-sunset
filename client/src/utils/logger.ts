/**
 * Modern Error Logging System with structured logging
 * Supports multiple log levels, context tracking, and error reporting
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
}

export interface LogContext {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: Error;
    stack?: string;
    fingerprint?: string;
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private context: LogContext = {};
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    private constructor() {
        // Set log level based on environment
        this.logLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;

        // Setup error boundary for unhandled errors
        this.setupGlobalErrorHandling();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setContext(context: Partial<LogContext>): void {
        this.context = { ...this.context, ...context };
    }

    public clearContext(): void {
        this.context = {};
    }

    public debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    public info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    public warn(message: string, context?: LogContext): void {
        this.log(LogLevel.WARN, message, context);
    }

    public error(message: string, error?: Error, context?: LogContext): void {
        this.log(LogLevel.ERROR, message, context, error);
    }

    public fatal(message: string, error?: Error, context?: LogContext): void {
        this.log(LogLevel.FATAL, message, context, error);
    }

    private log(
        level: LogLevel,
        message: string,
        context?: LogContext,
        error?: Error
    ): void {
        if (level < this.logLevel) {
            return;
        }

        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: { ...this.context, ...context },
            error,
            stack: error?.stack,
            fingerprint: this.generateFingerprint(message, error),
        };

        // Add to internal log store
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with styling
        this.consoleOutput(logEntry);

        // Send to external services in production
        if (!import.meta.env.DEV && level >= LogLevel.ERROR) {
            this.sendToExternalService(logEntry);
        }
    }

    private consoleOutput(entry: LogEntry): void {
        const { timestamp, level, message, context, error } = entry;
        const levelName = LogLevel[level];
        const timeStr = new Date(timestamp).toLocaleTimeString();

        const styles = {
            [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal;',
            [LogLevel.INFO]: 'color: #3b82f6; font-weight: normal;',
            [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
            [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
            [LogLevel.FATAL]: 'color: #dc2626; background: #fef2f2; font-weight: bold; padding: 2px 4px;',
        };

        console.log(
            `%c[${timeStr}] ${levelName}: ${message}`,
            styles[level]
        );

        if (context && Object.keys(context).length > 0) {
            console.log('📍 Context:', context);
        }

        if (error) {
            console.error('💥 Error:', error);
            if (error.stack) {
                console.trace('🔍 Stack trace:', error.stack);
            }
        }
    }

    private generateFingerprint(message: string, error?: Error): string {
        const content = error ? `${message}:${error.name}:${error.message}` : message;
        return btoa(content).substring(0, 12);
    }

    private setupGlobalErrorHandling(): void {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', new Error(event.reason), {
                component: 'GlobalErrorHandler',
                action: 'unhandledrejection',
            });
        });

        // Global JavaScript errors
        window.addEventListener('error', (event) => {
            this.error('Global JavaScript Error', event.error, {
                component: 'GlobalErrorHandler',
                action: 'error',
                metadata: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                },
            });
        });
    }

    private async sendToExternalService(entry: LogEntry): Promise<void> {
        try {
            // In a real app, send to services like Sentry, LogRocket, or custom endpoint
            // For now, we'll use a placeholder
            if (window.location.hostname !== 'localhost') {
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                });
            }
        } catch (error) {
            console.error('Failed to send log to external service:', error);
        }
    }

    public getLogs(level?: LogLevel): LogEntry[] {
        if (level !== undefined) {
            return this.logs.filter(log => log.level >= level);
        }
        return [...this.logs];
    }

    public clearLogs(): void {
        this.logs = [];
    }

    public exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
    debug: (message: string, context?: LogContext) => logger.debug(message, context),
    info: (message: string, context?: LogContext) => logger.info(message, context),
    warn: (message: string, context?: LogContext) => logger.warn(message, context),
    error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
    fatal: (message: string, error?: Error, context?: LogContext) => logger.fatal(message, error, context),
    setContext: (context: Partial<LogContext>) => logger.setContext(context),
    clearContext: () => logger.clearContext(),
};
