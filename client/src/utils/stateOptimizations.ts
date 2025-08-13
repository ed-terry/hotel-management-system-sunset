import { useCallback, useRef, useMemo, useReducer } from 'react';

/**
 * Enhanced state management with performance optimizations
 */
export interface StateManagerOptions<T> {
    initialState: T;
    debugLabel?: string;
    middleware?: Array<(state: T, action: any) => T>;
    equalityFn?: (prev: T, next: T) => boolean;
}

export interface StateManager<T> {
    state: T;
    setState: (update: Partial<T> | ((prev: T) => Partial<T>)) => void;
    resetState: () => void;
    getSnapshot: () => T;
    subscribe: (listener: (state: T) => void) => () => void;
}

export function createStateManager<T extends Record<string, any>>({
    initialState,
    debugLabel = 'StateManager',
    middleware = [],
    equalityFn = (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
}: StateManagerOptions<T>): StateManager<T> {
    let currentState = { ...initialState };
    const listeners = new Set<(state: T) => void>();

    const applyMiddleware = (state: T, action: any): T => {
        return middleware.reduce((acc, mw) => mw(acc, action), state);
    };

    const setState = (update: Partial<T> | ((prev: T) => Partial<T>)) => {
        const nextPartial = typeof update === 'function' ? update(currentState) : update;
        const nextState = { ...currentState, ...nextPartial };

        if (!equalityFn(currentState, nextState)) {
            const beforeState = currentState;
            currentState = applyMiddleware(nextState, { type: 'UPDATE', payload: nextPartial });

            if (import.meta.env.DEV) {
                console.log(`🔄 ${debugLabel} state updated:`, {
                    before: beforeState,
                    after: currentState,
                    change: nextPartial,
                });
            }

            listeners.forEach(listener => listener(currentState));
        }
    };

    const resetState = () => {
        const nextState = { ...initialState };
        if (!equalityFn(currentState, nextState)) {
            currentState = nextState;

            if (import.meta.env.DEV) {
                console.log(`🔄 ${debugLabel} state reset to initial state`);
            }

            listeners.forEach(listener => listener(currentState));
        }
    };

    const getSnapshot = () => currentState;

    const subscribe = (listener: (state: T) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return {
        get state() { return currentState; },
        setState,
        resetState,
        getSnapshot,
        subscribe,
    };
}

/**
 * Hook for using state manager with React
 */
export function useStateManager<T extends Record<string, any>>(
    manager: StateManager<T>
) {
    const forceUpdate = useReducer((x: number) => x + 1, 0)[1];
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Subscribe to state changes
    useMemo(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }

        unsubscribeRef.current = manager.subscribe(() => {
            forceUpdate();
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [manager, forceUpdate]);

    return {
        state: manager.state,
        setState: manager.setState,
        resetState: manager.resetState,
    };
}

/**
 * Advanced reducer with async support and middleware
 */
export interface AsyncAction<T = any> {
    type: string;
    payload?: T;
    meta?: {
        async?: boolean;
        optimistic?: boolean;
        rollback?: any;
    };
}

export type AsyncReducer<S, A extends AsyncAction> = (state: S, action: A) => S | Promise<S>;

export function useAsyncReducer<S, A extends AsyncAction>(
    reducer: AsyncReducer<S, A>,
    initialState: S,
    options: {
        debugLabel?: string;
        onError?: (error: Error, action: A, state: S) => void;
        middleware?: Array<(state: S, action: A) => S>;
    } = {}
) {
    const { debugLabel = 'AsyncReducer', onError, middleware = [] } = options;

    const [state, dispatch] = useReducer(
        (currentState: S, action: A & { _internal?: boolean }) => {
            try {
                if (action._internal) {
                    return action.payload;
                }

                let nextState = currentState;

                // Apply middleware
                middleware.forEach(mw => {
                    nextState = mw(nextState, action);
                });

                const result = reducer(nextState, action);

                if (result instanceof Promise) {
                    // Handle async actions
                    result
                        .then(asyncState => {
                            dispatch({ type: '_ASYNC_RESOLVED', payload: asyncState, _internal: true } as any);
                        })
                        .catch(error => {
                            console.error(`❌ ${debugLabel} async action failed:`, error);
                            onError?.(error, action, currentState);

                            if (action.meta?.rollback) {
                                dispatch({ type: '_ASYNC_ROLLBACK', payload: action.meta.rollback, _internal: true } as any);
                            }
                        });

                    // Return optimistic state if available
                    return action.meta?.optimistic ? action.meta.optimistic : currentState;
                }

                if (import.meta.env.DEV) {
                    console.log(`🔄 ${debugLabel} action dispatched:`, {
                        action: action.type,
                        payload: action.payload,
                        previousState: currentState,
                        nextState: result,
                    });
                }

                return result;
            } catch (error) {
                console.error(`❌ ${debugLabel} reducer error:`, error);
                onError?.(error as Error, action, currentState);
                return currentState;
            }
        },
        initialState
    );

    const enhancedDispatch = useCallback((action: A) => {
        dispatch(action);
    }, []);

    return [state, enhancedDispatch] as const;
}

/**
 * Optimized form state management
 */
export interface FormField {
    value: any;
    error?: string;
    touched?: boolean;
    dirty?: boolean;
}

export interface FormState {
    [key: string]: FormField;
}

export interface FormOptions {
    initialValues: Record<string, any>;
    validationSchema?: Record<string, (value: any) => string | undefined>;
    onSubmit?: (values: Record<string, any>) => void | Promise<void>;
    debugLabel?: string;
}

export function useOptimizedForm({
    initialValues,
    validationSchema = {},
    onSubmit,
    debugLabel = 'OptimizedForm',
}: FormOptions) {
    const initialState: FormState = useMemo(() => {
        const state: FormState = {};
        Object.entries(initialValues).forEach(([key, value]) => {
            state[key] = {
                value,
                touched: false,
                dirty: false,
            };
        });
        return state;
    }, [initialValues]);

    const [formState, setFormState] = useReducer(
        (state: FormState, action: { type: string; field?: string; value?: any; error?: string }) => {
            switch (action.type) {
                case 'SET_FIELD':
                    return {
                        ...state,
                        [action.field!]: {
                            ...state[action.field!],
                            value: action.value,
                            dirty: action.value !== initialValues[action.field!],
                            error: validationSchema[action.field!]?.(action.value),
                        },
                    };

                case 'SET_TOUCHED':
                    return {
                        ...state,
                        [action.field!]: {
                            ...state[action.field!],
                            touched: true,
                        },
                    };

                case 'SET_ERROR':
                    return {
                        ...state,
                        [action.field!]: {
                            ...state[action.field!],
                            error: action.error,
                        },
                    };

                case 'RESET':
                    return initialState;

                default:
                    return state;
            }
        },
        initialState
    );

    const setFieldValue = useCallback((field: string, value: any) => {
        setFormState({ type: 'SET_FIELD', field, value });
    }, []);

    const setFieldTouched = useCallback((field: string) => {
        setFormState({ type: 'SET_TOUCHED', field });
    }, []);

    const setFieldError = useCallback((field: string, error: string) => {
        setFormState({ type: 'SET_ERROR', field, error });
    }, []);

    const resetForm = useCallback(() => {
        setFormState({ type: 'RESET' });
    }, []);

    const values = useMemo(() => {
        const vals: Record<string, any> = {};
        Object.entries(formState).forEach(([key, field]) => {
            vals[key] = field.value;
        });
        return vals;
    }, [formState]);

    const errors = useMemo(() => {
        const errs: Record<string, string> = {};
        Object.entries(formState).forEach(([key, field]) => {
            if (field.error && field.touched) {
                errs[key] = field.error;
            }
        });
        return errs;
    }, [formState]);

    const isValid = useMemo(() => {
        return Object.values(errors).every(error => !error);
    }, [errors]);

    const isDirty = useMemo(() => {
        return Object.values(formState).some(field => field.dirty);
    }, [formState]);

    const handleSubmit = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault();

            if (!isValid) {
                if (import.meta.env.DEV) {
                    console.warn(`⚠️ ${debugLabel} submission blocked - form has errors:`, errors);
                }
                return;
            }

            try {
                if (import.meta.env.DEV) {
                    console.log(`📝 ${debugLabel} submitting values:`, values);
                }

                await onSubmit?.(values);
            } catch (error) {
                console.error(`❌ ${debugLabel} submission failed:`, error);
            }
        },
        [isValid, values, errors, onSubmit, debugLabel]
    );

    return {
        values,
        errors,
        formState,
        isValid,
        isDirty,
        setFieldValue,
        setFieldTouched,
        setFieldError,
        resetForm,
        handleSubmit,
    };
}

/**
 * Cache manager with TTL and memory optimization
 */
export class OptimizedCache<T = any> {
    private cache = new Map<string, { value: T; expiry: number; hits: number }>();
    private maxSize: number;
    private defaultTTL: number;
    private debugLabel: string;

    constructor(options: {
        maxSize?: number;
        defaultTTL?: number;
        debugLabel?: string;
    } = {}) {
        this.maxSize = options.maxSize ?? 100;
        this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
        this.debugLabel = options.debugLabel ?? 'OptimizedCache';
    }

    set(key: string, value: T, ttl?: number): void {
        // Remove expired entries and enforce size limit
        this.cleanup();

        if (this.cache.size >= this.maxSize) {
            // Remove least recently used item
            const lruKey = this.getLRUKey();
            if (lruKey) {
                this.cache.delete(lruKey);
            }
        }

        const expiry = Date.now() + (ttl ?? this.defaultTTL);
        this.cache.set(key, { value, expiry, hits: 0 });

        if (import.meta.env.DEV) {
            console.log(`💾 ${this.debugLabel} cached: ${key} (TTL: ${ttl ?? this.defaultTTL}ms)`);
        }
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return undefined;
        }

        entry.hits++;
        return entry.value;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        return entry ? Date.now() <= entry.expiry : false;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();

        if (import.meta.env.DEV) {
            console.log(`🗑️ ${this.debugLabel} cache cleared`);
        }
    }

    private cleanup(): void {
        const now = Date.now();
        let removedCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
                removedCount++;
            }
        }

        if (removedCount > 0 && import.meta.env.DEV) {
            console.log(`🧹 ${this.debugLabel} removed ${removedCount} expired entries`);
        }
    }

    private getLRUKey(): string | undefined {
        let lruKey: string | undefined;
        let minHits = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.hits < minHits) {
                minHits = entry.hits;
                lruKey = key;
            }
        }

        return lruKey;
    }

    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        let totalHits = 0;

        for (const entry of this.cache.values()) {
            if (now <= entry.expiry) {
                validEntries++;
                totalHits += entry.hits;
            } else {
                expiredEntries++;
            }
        }

        return {
            size: this.cache.size,
            validEntries,
            expiredEntries,
            totalHits,
            hitRate: validEntries > 0 ? totalHits / validEntries : 0,
            maxSize: this.maxSize,
        };
    }
}

// Global cache instance
export const globalCache = new OptimizedCache({
    maxSize: 500,
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    debugLabel: 'GlobalCache',
});
