import React from 'react';
import { PerformanceTimer } from './analyticsOptimizations';

/**
 * Performance testing utilities for React components
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
 * Mock render function for testing without dependencies
 */
interface MockRenderResult {
    container: HTMLElement;
    unmount: () => void;
}

function mockRender(element: React.ReactElement): MockRenderResult {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // This is a simplified mock - in real testing you'd use @testing-library/react
    return {
        container,
        unmount: () => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        },
    };
}

/**
 * Performance testing utilities for React components
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
 * Comprehensive performance testing for React components
 */
export class ComponentPerformanceTester {
    private component: React.ComponentType<any>;
    private props: any;
    private options: Required<PerformanceTestOptions>;

    constructor(
        component: React.ComponentType<any>,
        props: any = {},
        options: PerformanceTestOptions = {}
    ) {
        this.component = component;
        this.props = props;
        this.options = {
            iterations: options.iterations ?? 10,
            warmupRuns: options.warmupRuns ?? 3,
            measureMemory: options.measureMemory ?? true,
            trackReRenders: options.trackReRenders ?? true,
            timeout: options.timeout ?? 5000,
        };
    }

    async runPerformanceTest(): Promise<PerformanceTestResult> {
        const results: PerformanceTestResult[] = [];

        // Warmup runs
        for (let i = 0; i < this.options.warmupRuns; i++) {
            await this.singleRenderTest();
        }

        // Actual test runs
        for (let i = 0; i < this.options.iterations; i++) {
            const result = await this.singleRenderTest();
            results.push(result);
        }

        // Calculate averages
        return this.calculateAverages(results);
    }

    private async singleRenderTest(): Promise<PerformanceTestResult> {
        const timer = new PerformanceTimer('component_render_test');
        let renderResult: RenderResult;
        let memoryBefore = 0;
        let memoryAfter = 0;

        // Measure memory before render
        if (this.options.measureMemory && 'memory' in performance) {
            memoryBefore = (performance as any).memory.usedJSHeapSize;
        }

        // Render component
        timer.mark('render_start');
        renderResult = render(React.createElement(this.component, this.props));
        timer.mark('render_end');

        // Measure memory after render
        if (this.options.measureMemory && 'memory' in performance) {
            memoryAfter = (performance as any).memory.usedJSHeapSize;
        }

        const renderTime = timer.end();
        const memoryUsage = memoryAfter - memoryBefore;
        const domNodeCount = renderResult.container.querySelectorAll('*').length;

        // Cleanup
        renderResult.unmount();

        return {
            renderTime,
            memoryUsage,
            componentCount: 1, // Single component for now
            reRenderCount: 0, // Not implemented in single render
            domNodeCount,
        };
    }

    private calculateAverages(results: PerformanceTestResult[]): PerformanceTestResult {
        const totals = results.reduce(
            (acc, result) => ({
                renderTime: acc.renderTime + result.renderTime,
                memoryUsage: acc.memoryUsage + result.memoryUsage,
                componentCount: acc.componentCount + result.componentCount,
                reRenderCount: acc.reRenderCount + result.reRenderCount,
                domNodeCount: acc.domNodeCount + result.domNodeCount,
            }),
            { renderTime: 0, memoryUsage: 0, componentCount: 0, reRenderCount: 0, domNodeCount: 0 }
        );

        const count = results.length;
        return {
            renderTime: totals.renderTime / count,
            memoryUsage: totals.memoryUsage / count,
            componentCount: totals.componentCount / count,
            reRenderCount: totals.reRenderCount / count,
            domNodeCount: totals.domNodeCount / count,
        };
    }
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

        const decreases = this.samples.filter((sample, index) =>
            index > 0 && sample < this.samples[index - 1]
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
    private bundleData: any;

    constructor(bundleData?: any) {
        this.bundleData = bundleData;
    }

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

    benchmark(name: string, fn: () => void | Promise<void>, iterations: number = 100): Promise<BenchmarkResult> {
        return new Promise(async (resolve) => {
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

            resolve(this.calculateBenchmarkStats(name, times));
        });
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
 * React-specific performance testing utilities
 */
export function measureComponentRenderTime<P>(
    Component: React.ComponentType<P>,
    props: P
): Promise<number> {
    return new Promise((resolve) => {
        const start = performance.now();

        const TestWrapper = () => {
            React.useEffect(() => {
                const end = performance.now();
                resolve(end - start);
            });

            return React.createElement(Component, props);
        };

        render(React.createElement(TestWrapper));
    });
}

export function countReRenders<P>(
    Component: React.ComponentType<P>,
    props: P,
    propChanges: Array<Partial<P>>
): Promise<number> {
    return new Promise((resolve) => {
        let renderCount = 0;

        const TestWrapper = (wrapperProps: P) => {
            renderCount++;

            React.useEffect(() => {
                if (renderCount > propChanges.length) {
                    resolve(renderCount);
                }
            });

            return React.createElement(Component, wrapperProps);
        };

        const { rerender } = render(React.createElement(TestWrapper, props));

        propChanges.forEach(change => {
            rerender(React.createElement(TestWrapper, { ...props, ...change }));
        });
    });
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

        focusableElements.forEach((el, index) => {
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

// Export testing utilities
export {
    ComponentPerformanceTester,
    MemoryLeakDetector,
    BundleAnalyzer,
    PerformanceBenchmark,
};
