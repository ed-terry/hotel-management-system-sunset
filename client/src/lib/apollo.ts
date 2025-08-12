import { ApolloClient, InMemoryCache, ApolloProvider, from, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client/link/http';
import * as Sentry from '@sentry/react';
import { toast } from 'react-toastify';

// Helper function to get user-friendly error messages
function getErrorMessage(code: string | undefined, defaultMessage: string): string {
    switch (code) {
        case 'UNAUTHENTICATED':
            return 'Please log in to continue';
        case 'FORBIDDEN':
            return 'You do not have permission to perform this action';
        case 'BAD_USER_INPUT':
            return 'Please check your input and try again';
        case 'INTERNAL_SERVER_ERROR':
            return 'An unexpected error occurred. Our team has been notified';
        default:
            return defaultMessage;
    }
}

// Create an error link for handling GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            // Log to Sentry with better context
            Sentry.captureException(new Error(message), {
                extra: {
                    locations,
                    path,
                    operationName: operation.operationName,
                    variables: operation.variables,
                    errorCode: extensions?.code,
                    errorDetails: extensions?.details,
                },
                tags: {
                    graphql_operation: operation.operationName,
                    error_type: 'graphql',
                    error_code: extensions?.code ? String(extensions.code) : undefined,
                },
            });

            // Show user-friendly error based on error code
            const userMessage = getErrorMessage(extensions?.code as string, message);
            toast.error(userMessage, {
                toastId: `gql-${operation.operationName}`,
                autoClose: 5000,
            });

            if (import.meta.env.DEV) {
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${extensions?.code}`
                );
            }
        });
    }

    if (networkError) {
        const isServerError = 'statusCode' in networkError;

        // Log to Sentry with network context
        Sentry.captureException(networkError, {
            extra: {
                operation: operation.operationName,
                variables: operation.variables,
                statusCode: isServerError ? networkError.statusCode : undefined,
            },
            tags: {
                graphql_operation: operation.operationName,
                error_type: 'network',
                status_code: isServerError ? String(networkError.statusCode) : 'unknown',
            },
        });

        // Show different messages based on error type
        if (!navigator.onLine) {
            toast.error('You appear to be offline. Please check your internet connection.', {
                toastId: 'offline-error',
                autoClose: false,
            });
        } else if (isServerError && networkError.statusCode >= 500) {
            toast.error('Server error. Our team has been notified.', {
                toastId: 'server-error',
            });
        } else {
            toast.error('Network error. Please try again later.', {
                toastId: 'network-error',
            });
        }

        if (import.meta.env.DEV) {
            console.error(`[Network error]: `, networkError);
        }

        // Dispatch event for offline handling
        window.dispatchEvent(new CustomEvent('apollo-network-error', {
            detail: networkError
        }));
    }

    // Optionally retry the operation
    const currentAttempt = operation.getContext().attempt || 0;
    if (networkError && currentAttempt < 3) {
        const delay = Math.min(1000 * Math.pow(2, currentAttempt), 30000);

        return new Observable(observer => {
            setTimeout(() => {
                operation.setContext(({ attempt = 0, ...rest }) => ({
                    ...rest,
                    attempt: attempt + 1,
                }));
                forward(operation).subscribe(observer);
            }, delay);
        });
    }
});

const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
    },
});

export { client, ApolloProvider };
