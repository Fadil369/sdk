/**
 * Performance monitoring and optimization utilities
 */

import { PerformanceMetrics } from '@/types/config';

export interface PerformanceConfig {
  targetFps: number;
  lazyLoading: boolean;
  virtualScrolling: boolean;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private onMetric?: (metric: PerformanceMetrics) => void;
  private metrics: PerformanceMetrics;
  private intervalId?: NodeJS.Timeout;
  private frameCount = 0;
  private lastFrameTime = 0;

  constructor(config: PerformanceConfig, onMetric?: (metric: PerformanceMetrics) => void) {
    this.config = config;
    this.onMetric = onMetric;
    this.metrics = {
      apiResponseTime: 0,
      uiFrameRate: 0,
      memoryUsage: 0,
      concurrentUsers: 0,
    };
  }

  start(): void {
    this.intervalId = setInterval(() => {
      this.updateMetrics();
    }, 1000); // Update metrics every second

    // Start FPS monitoring if in browser environment
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      this.startFpsMonitoring();
    }
  }

  stop(): Promise<void> {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    return Promise.resolve();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  recordApiResponse(responseTime: number): void {
    // Use exponential moving average for smoothing
    const alpha = 0.1;
    this.metrics.apiResponseTime =
      this.metrics.apiResponseTime === 0
        ? responseTime
        : alpha * responseTime + (1 - alpha) * this.metrics.apiResponseTime;

    // Alert if response time exceeds target (2.5s)
    if (responseTime > 2500) {
      this.onMetric?.({
        ...this.metrics,
        apiResponseTime: responseTime,
      });
    }
  }

  incrementConcurrentUsers(): void {
    this.metrics.concurrentUsers++;
  }

  decrementConcurrentUsers(): void {
    this.metrics.concurrentUsers = Math.max(0, this.metrics.concurrentUsers - 1);
  }

  private updateMetrics(): void {
    // Update memory usage
    if (process?.memoryUsage) {
      const memory = process.memoryUsage();
      this.metrics.memoryUsage = memory.heapUsed / 1024 / 1024; // MB
    } else if (typeof performance !== 'undefined') {
      // Use optional chaining and type assertion
      const performanceMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (performanceMemory?.usedJSHeapSize) {
        this.metrics.memoryUsage = performanceMemory.usedJSHeapSize / 1024 / 1024; // MB
      }
    }

    // Emit metrics if callback is provided
    this.onMetric?.(this.metrics);
  }

  private startFpsMonitoring(): void {
    const measureFps = (timestamp: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp;
        this.frameCount = 0;
      } else {
        this.frameCount++;
        const elapsed = timestamp - this.lastFrameTime;

        if (elapsed >= 1000) {
          // Calculate FPS every second
          const fps = Math.round((this.frameCount * 1000) / elapsed);
          this.metrics.uiFrameRate = fps;

          // Alert if FPS drops below target
          if (fps < this.config.targetFps * 0.8) {
            // 80% of target
            this.onMetric?.({
              ...this.metrics,
              uiFrameRate: fps,
            });
          }

          this.lastFrameTime = timestamp;
          this.frameCount = 0;
        }
      }

      requestAnimationFrame(measureFps);
    };

    requestAnimationFrame(measureFps);
  }

  // Performance optimization utilities
  debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: unknown[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: unknown[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  }

  memoize<T extends (...args: unknown[]) => unknown>(func: T): T {
    const cache = new Map<string, unknown>();
    return ((...args: unknown[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  createVirtualList<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number
  ): { visibleItems: T[]; startIndex: number; endIndex: number } {
    if (!this.config.virtualScrolling) {
      return { visibleItems: items, startIndex: 0, endIndex: items.length - 1 };
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(visibleCount / 2); // Add buffer for smooth scrolling

    const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight) - buffer);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + buffer * 2);

    return {
      visibleItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
    };
  }
}
