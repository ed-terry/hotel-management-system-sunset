import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Advanced hook for memoizing expensive computations with automatic cache management
 */
export function useSmartMemo<T>(
    factory: () => T,
    deps: React.DependencyList,
    options: {
        maxCacheSize?: number;
        ttl?: number; // Time to live in milliseconds
        debugLabel?: string;
    } = {}
): T {
    const { maxCacheSize = 50, ttl = 5 * 60 * 1000, debugLabel } = options;

    const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
    const cleanupTimerRef = useRef<number>();

    const cacheKey = useMemo(() => {
        return JSON.stringify(deps);
    }, deps);

    // Cleanup expired entries
    const cleanupCache = useCallback(() => {
        const now = Date.now();
        const cache = cacheRef.current;

        for (const [key, entry] of cache.entries()) {
            if (now - entry.timestamp > ttl) {
                cache.delete(key);
                if (debugLabel && import.meta.env.DEV) {
                    console.log(`🗑️ Cache cleanup: ${debugLabel} - ${key}`);
                }
            }
        }

        // Also enforce max cache size
        if (cache.size > maxCacheSize) {
            const sortedEntries = Array.from(cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp);

            const toDelete = sortedEntries.slice(0, cache.size - maxCacheSize);
            toDelete.forEach(([key]) => cache.delete(key));

            if (debugLabel && import.meta.env.DEV) {
                console.log(`🗑️ Cache size limit: ${debugLabel} - removed ${toDelete.length} entries`);
            }
        }
    }, [ttl, maxCacheSize, debugLabel]);

    // Schedule periodic cleanup
    useEffect(() => {
        cleanupTimerRef.current = setInterval(cleanupCache, ttl / 2);
        return () => {
            if (cleanupTimerRef.current) {
                clearInterval(cleanupTimerRef.current);
            }
        };
    }, [cleanupCache, ttl]);

    return useMemo(() => {
        const cache = cacheRef.current;
        const cachedEntry = cache.get(cacheKey);

        if (cachedEntry && Date.now() - cachedEntry.timestamp < ttl) {
            if (debugLabel && import.meta.env.DEV) {
                console.log(`💾 Cache hit: ${debugLabel} - ${cacheKey.slice(0, 50)}...`);
            }
            return cachedEntry.value;
        }

        // Cache miss - compute new value
        const startTime = performance.now();
        const value = factory();
        const endTime = performance.now();

        cache.set(cacheKey, { value, timestamp: Date.now() });

        if (debugLabel && import.meta.env.DEV) {
            console.log(`🔄 Cache miss: ${debugLabel} - computed in ${(endTime - startTime).toFixed(2)}ms`);
        }

        return value;
    }, [cacheKey, factory, ttl, debugLabel]);
}

/**
 * Hook for debouncing expensive operations with memory optimization
 */
export function useSmartDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    options: {
        maxPending?: number;
        debugLabel?: string;
    } = {}
): T {
    const { maxPending = 10, debugLabel } = options;
    const timeoutRef = useRef<number>();
    const pendingCallsRef = useRef<number>(0);
    const lastArgsRef = useRef<Parameters<T>>();

    return useCallback(
        ((...args: Parameters<T>) => {
            // Track pending calls to prevent memory leaks
            if (pendingCallsRef.current >= maxPending) {
                if (debugLabel && import.meta.env.DEV) {
                    console.warn(`⚠️ Max pending calls reached for ${debugLabel}, dropping call`);
                }
                return;
            }

            lastArgsRef.current = args;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                pendingCallsRef.current--;
            }

            pendingCallsRef.current++;

            timeoutRef.current = setTimeout(() => {
                if (lastArgsRef.current) {
                    callback(...lastArgsRef.current);
                    pendingCallsRef.current--;

                    if (debugLabel && import.meta.env.DEV) {
                        console.log(`🔄 Debounced execution: ${debugLabel}`);
                    }
                }
            }, delay);
        }) as T,
        [callback, delay, maxPending, debugLabel]
    );
}

/**
 * Hook for intelligent virtual scrolling with performance optimization
 */
export function useVirtualScrolling<T>(
    items: T[],
    options: {
        itemHeight: number;
        containerHeight: number;
        overscan?: number;
        debugLabel?: string;
    }
) {
    const { itemHeight, containerHeight, overscan = 5, debugLabel } = options;

    return useMemo(() => {
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const totalHeight = items.length * itemHeight;

        const getVisibleRange = (scrollTop: number) => {
            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(
                startIndex + visibleCount + overscan,
                items.length
            );

            const visibleStartIndex = Math.max(0, startIndex - overscan);

            if (debugLabel && import.meta.env.DEV && startIndex % 50 === 0) {
                console.log(`📊 Virtual scroll: ${debugLabel} - showing ${visibleStartIndex}-${endIndex} of ${items.length}`);
            }

            return {
                startIndex: visibleStartIndex,
                endIndex,
                visibleItems: items.slice(visibleStartIndex, endIndex),
                offsetY: visibleStartIndex * itemHeight
            };
        };

        return {
            totalHeight,
            getVisibleRange,
            itemHeight,
            visibleCount
        };
    }, [items, itemHeight, containerHeight, overscan, debugLabel]);
}

/**
 * Hook for tracking component lifecycle and memory usage
 */
export function useLifecycleTracking(componentName: string) {
    const mountTimeRef = useRef<number>(Date.now());
    const renderCountRef = useRef<number>(0);

    useEffect(() => {
        renderCountRef.current++;

        if (import.meta.env.DEV) {
            const renderTime = Date.now() - mountTimeRef.current;

            if (renderCountRef.current === 1) {
                console.log(`🚀 Component mounted: ${componentName}`);
            }

            if (renderCountRef.current % 10 === 0) {
                console.log(`🔄 ${componentName} - ${renderCountRef.current} renders in ${renderTime}ms`);
            }
        }

        return () => {
            if (import.meta.env.DEV) {
                console.log(`💀 Component unmounted: ${componentName} after ${renderCountRef.current} renders`);
            }
        };
    });

    return {
        renderCount: renderCountRef.current,
        uptime: Date.now() - mountTimeRef.current
    };
}

/**
 * Hook for lazy loading with intersection observer
 */
export function useLazyLoading(
    options: {
        threshold?: number;
        rootMargin?: string;
        debugLabel?: string;
    } = {}
) {
    const { threshold = 0.1, rootMargin = '50px', debugLabel } = options;
    const targetRef = useRef<HTMLElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const [isInView, setIsInView] = useState(false);
    const [hasBeenInView, setHasBeenInView] = useState(false);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                const inView = entry.isIntersecting;
                setIsInView(inView);

                if (inView && !hasBeenInView) {
                    setHasBeenInView(true);
                    if (debugLabel && import.meta.env.DEV) {
                        console.log(`👁️ Lazy load triggered: ${debugLabel}`);
                    }
                }
            },
            { threshold, rootMargin }
        );

        observerRef.current.observe(target);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [threshold, rootMargin, debugLabel, hasBeenInView]);

    return {
        targetRef,
        isInView,
        hasBeenInView,
        shouldLoad: hasBeenInView || isInView
    };
}
