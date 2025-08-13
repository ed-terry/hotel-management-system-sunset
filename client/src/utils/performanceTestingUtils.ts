/**
 * Simplified performance testing utilities
 */
export interface PerformanceTestResult {
    renderTime: number;
    memoryUsage: number;
    componentCount: number;
    reRenderCount: number;
    domNodeCount: number;
}

export interface PerformanceTestOptions {
    iterations?: number;
    warmupRuns?: number;
    measureMemory?: boolean;
    trackReRenders?: boolean;
    timeout?: number;
}

/**
 * Memory leak detection utilities
 */
export class MemoryLeakDetector {
    private initialMemory: number = 0;
    private samples: number[] = [];
    private interval: number = 0;
    private isRunning: boolean = false;

    start(samplingInterval: number = 1000): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.samples = [];

        if ('memory' in performance) {
            this.initialMemory = (performance as any).memory.usedJSHeapSize;

            this.interval = window.setInterval(() => {
                this.samples.push((performance as any).memory.usedJSHeapSize);
            }, samplingInterval);
        }
    }

    stop(): MemoryLeakReport {
        if (!this.isRunning) {
            throw new Error('Memory leak detector not running');
        }

        this.isRunning = false;
        clearInterval(this.interval);

        return this.generateReport();
    }

    private generateReport(): MemoryLeakReport {
        if (this.samples.length === 0) {
            return {
                hasLeak: false,
                initialMemory: this.initialMemory,
                finalMemory: this.initialMemory,
                memoryGrowth: 0,
                growthRate: 0,
                samples: [],
                analysis: 'No memory data available',
            };
        }

        const finalMemory = this.samples[this.samples.length - 1];
        const memoryGrowth = finalMemory - this.initialMemory;
        const growthRate = memoryGrowth / this.samples.length;

        // Simple heuristic: if memory consistently grows, might be a leak
        const trendingUp = this.samples.slice(-5).every((sample, index, arr) =>
            index === 0 || sample >= arr[index - 1]
        );

        const hasLeak = trendingUp && growthRate > 1024; // More than 1KB per sample

        return {
            hasLeak,
            initialMemory: this.initialMemory,
            finalMemory,
            memoryGrowth,
            growthRate,
            samples: [...this.samples],
            analysis: this.analyzeMemoryPattern(),
        };
    }

    private analyzeMemoryPattern(): string {
        if (this.samples.length < 3) {
            return 'Insufficient data for analysis';
        }

        const increases = this.samples.filter((sample, index) =>
            index > 0 && sample > this.samples[index - 1]
        ).length;

        const increaseRatio = increases / (this.samples.length - 1);

        if (increaseRatio > 0.8) {
            return 'Memory consistently increasing - potential leak';
        } else if (increaseRatio < 0.2) {
            return 'Memory stable or decreasing - no leak detected';
        } else {
            return 'Memory usage fluctuating - monitor for patterns';
        }
    }
}

export interface MemoryLeakReport {
    hasLeak: boolean;
    initialMemory: number;
    finalMemory: number;
    memoryGrowth: number;
    growthRate: number;
    samples: number[];
    analysis: string;
}

/**
 * Bundle size analysis utilities
 */
export interface BundleAnalysis {
    totalSize: number;
    gzippedSize: number;
    chunkSizes: Record<string, number>;
    dependencies: Array<{
        name: string;
        size: number;
        percentage: number;
    }>;
    recommendations: string[];
}

export class BundleAnalyzer {
    analyze(): BundleAnalysis {
        // This would typically analyze webpack bundle stats
        // For now, return mock data structure
        return {
            totalSize: 0,
            gzippedSize: 0,
            chunkSizes: {},
            dependencies: [],
            recommendations: [
                'Consider code splitting for large dependencies',
                'Implement tree shaking for unused code',
                'Use dynamic imports for non-critical code',
                'Optimize images and static assets',
            ],
        };
    }

    getDuplicateDependencies(): Array<{ name: string; occurrences: number; totalSize: number }> {
        // Analyze for duplicate dependencies
        return [];
    }

    getUnusedCode(): Array<{ file: string; size: number; reason: string }> {
        // Detect potentially unused code
        return [];
    }
}

/**
 * Performance benchmarking utilities
 */
export class PerformanceBenchmark {
    private benchmarks: Map<string, number[]> = new Map();

    async benchmark(name: string, fn: () => void | Promise<void>, iterations: number = 100): Promise<BenchmarkResult> {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            try {
                const result = fn();
                if (result instanceof Promise) {
                    await result;
                }
            } catch (error) {
                console.error(`Benchmark error in ${name}:`, error);
            }

            const end = performance.now();
            times.push(end - start);
        }

        this.benchmarks.set(name, times);
        return this.calculateBenchmarkStats(name, times);
    }

    private calculateBenchmarkStats(name: string, times: number[]): BenchmarkResult {
        const sorted = times.slice().sort((a, b) => a - b);
        const total = times.reduce((sum, time) => sum + time, 0);
        const average = total / times.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        return {
            name,
            iterations: times.length,
            average,
            median,
            min,
            max,
            p95,
            p99,
            standardDeviation: this.calculateStandardDeviation(times, average),
            times,
        };
    }

    private calculateStandardDeviation(values: number[], mean: number): number {
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    compare(benchmark1: string, benchmark2: string): BenchmarkComparison | null {
        const result1 = this.benchmarks.get(benchmark1);
        const result2 = this.benchmarks.get(benchmark2);

        if (!result1 || !result2) {
            return null;
        }

        const avg1 = result1.reduce((sum, time) => sum + time, 0) / result1.length;
        const avg2 = result2.reduce((sum, time) => sum + time, 0) / result2.length;

        const improvement = ((avg1 - avg2) / avg1) * 100;
        const faster = improvement > 0 ? benchmark2 : benchmark1;
        const slower = improvement > 0 ? benchmark1 : benchmark2;

        return {
            benchmark1,
            benchmark2,
            improvement: Math.abs(improvement),
            faster,
            slower,
            summary: `${faster} is ${Math.abs(improvement).toFixed(2)}% faster than ${slower}`,
        };
    }

    getAllResults(): Record<string, BenchmarkResult> {
        const results: Record<string, BenchmarkResult> = {};

        for (const [name, times] of this.benchmarks.entries()) {
            results[name] = this.calculateBenchmarkStats(name, times);
        }

        return results;
    }
}

export interface BenchmarkResult {
    name: string;
    iterations: number;
    average: number;
    median: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    standardDeviation: number;
    times: number[];
}

export interface BenchmarkComparison {
    benchmark1: string;
    benchmark2: string;
    improvement: number;
    faster: string;
    slower: string;
    summary: string;
}

/**
 * Accessibility performance testing
 */
export interface A11yPerformanceResult {
    axeViolations: number;
    contrastIssues: number;
    keyboardNavigationTime: number;
    screenReaderAnnouncements: number;
    focusTraversalTime: number;
}

export async function testAccessibilityPerformance(
    element: HTMLElement
): Promise<A11yPerformanceResult> {
    const result: A11yPerformanceResult = {
        axeViolations: 0,
        contrastIssues: 0,
        keyboardNavigationTime: 0,
        screenReaderAnnouncements: 0,
        focusTraversalTime: 0,
    };

    // Test keyboard navigation performance
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
        const start = performance.now();

        focusableElements.forEach((el) => {
            (el as HTMLElement).focus();

            // Simulate Tab key press
            const event = new KeyboardEvent('keydown', { key: 'Tab' });
            el.dispatchEvent(event);
        });

        result.focusTraversalTime = performance.now() - start;
    }

    // Check for basic contrast issues (simplified)
    const textElements = element.querySelectorAll('*');
    let contrastIssues = 0;

    textElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        // Simplified contrast check - in reality you'd use a proper contrast ratio calculator
        if (color && backgroundColor && color === backgroundColor) {
            contrastIssues++;
        }
    });

    result.contrastIssues = contrastIssues;

    return result;
}

/**
 * Simple performance measurement utilities
 */
export class SimplePerformanceMeasurer {
    private startTime: number = 0;
    private measurements: Record<string, number[]> = {};

    start(): void {
        this.startTime = performance.now();
    }

    measure(label: string): number {
        const duration = performance.now() - this.startTime;

        if (!this.measurements[label]) {
            this.measurements[label] = [];
        }

        this.measurements[label].push(duration);

        if (import.meta.env.DEV) {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    getAverages(): Record<string, number> {
        const averages: Record<string, number> = {};

        Object.entries(this.measurements).forEach(([label, times]) => {
            averages[label] = times.reduce((sum, time) => sum + time, 0) / times.length;
        });

        return averages;
    }

    reset(): void {
        this.measurements = {};
        this.startTime = 0;
    }
}

/**
 * Network performance monitoring
 */
export class NetworkPerformanceMonitor {
    private observations: PerformanceResourceTiming[] = [];
    private observer?: PerformanceObserver;

    start(): void {
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                const entries = list.getEntries() as PerformanceResourceTiming[];
                this.observations.push(...entries);

                entries.forEach(entry => {
                    if (import.meta.env.DEV) {
                        console.log(`🌐 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });

            this.observer.observe({ entryTypes: ['resource'] });
        }
    }

    stop(): NetworkPerformanceReport {
        if (this.observer) {
            this.observer.disconnect();
        }

        const apiCalls = this.observations.filter(entry =>
            entry.name.includes('/api/') || entry.name.includes('/graphql')
        );

        const images = this.observations.filter(entry =>
            /\.(jpg|jpeg|png|gif|webp|svg)/.test(entry.name)
        );

        const scripts = this.observations.filter(entry =>
            /\.js$/.test(entry.name)
        );

        const styles = this.observations.filter(entry =>
            /\.css$/.test(entry.name)
        );

        return {
            totalRequests: this.observations.length,
            apiCalls: {
                count: apiCalls.length,
                averageDuration: this.calculateAverage(apiCalls.map(e => e.duration)),
                slowest: Math.max(...apiCalls.map(e => e.duration), 0),
            },
            images: {
                count: images.length,
                averageDuration: this.calculateAverage(images.map(e => e.duration)),
                totalSize: images.reduce((sum, e) => sum + (e.transferSize || 0), 0),
            },
            scripts: {
                count: scripts.length,
                averageDuration: this.calculateAverage(scripts.map(e => e.duration)),
                totalSize: scripts.reduce((sum, e) => sum + (e.transferSize || 0), 0),
            },
            styles: {
                count: styles.length,
                averageDuration: this.calculateAverage(styles.map(e => e.duration)),
                totalSize: styles.reduce((sum, e) => sum + (e.transferSize || 0), 0),
            },
        };
    }

    private calculateAverage(values: number[]): number {
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }
}

export interface NetworkPerformanceReport {
    totalRequests: number;
    apiCalls: {
        count: number;
        averageDuration: number;
        slowest: number;
    };
    images: {
        count: number;
        averageDuration: number;
        totalSize: number;
    };
    scripts: {
        count: number;
        averageDuration: number;
        totalSize: number;
    };
    styles: {
        count: number;
        averageDuration: number;
        totalSize: number;
    };
}
