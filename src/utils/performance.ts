/**
 * Enhanced performance utilities for healthcare applications
 */

export const measureTime = <T>(fn: () => T): [T, number] => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return [result, end - start];
};

export const measureAsyncTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return [result, end - start];
};

/**
 * Advanced performance profiler for healthcare operations
 */
export class HealthcarePerformanceProfiler {
  private measurements: Map<string, number[]> = new Map();
  private activeTimers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  startTimer(operationName: string): void {
    this.activeTimers.set(operationName, performance.now());
  }

  /**
   * End timing an operation and record the measurement
   */
  endTimer(operationName: string): number {
    const startTime = this.activeTimers.get(operationName);
    if (!startTime) {
      throw new Error(`Timer not started for operation: ${operationName}`);
    }

    const duration = performance.now() - startTime;
    this.activeTimers.delete(operationName);

    // Store measurement
    const measurements = this.measurements.get(operationName) || [];
    measurements.push(duration);
    this.measurements.set(operationName, measurements);

    return duration;
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operationName: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
    p95: number;
    p99: number;
  } | null {
    const measurements = this.measurements.get(operationName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const total = measurements.reduce((sum, val) => sum + val, 0);
    const average = total / count;
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const p95 = sorted[Math.floor(count * 0.95)] ?? max;
    const p99 = sorted[Math.floor(count * 0.99)] ?? max;

    return { count, average, min, max, total, p95, p99 };
  }

  /**
   * Get all operation statistics
   */
  getAllStats(): Record<string, ReturnType<HealthcarePerformanceProfiler['getStats']>> {
    const stats: Record<string, ReturnType<HealthcarePerformanceProfiler['getStats']>> = {};
    
    for (const operationName of this.measurements.keys()) {
      stats[operationName] = this.getStats(operationName);
    }

    return stats;
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
    this.activeTimers.clear();
  }

  /**
   * Check if operation is performing well (under threshold)
   */
  isPerformingWell(operationName: string, thresholdMs: number): boolean {
    const stats = this.getStats(operationName);
    return stats ? stats.p95 < thresholdMs : true;
  }

  /**
   * Generate performance report for healthcare operations
   */
  generateHealthcareReport(): {
    totalOperations: number;
    slowOperations: string[];
    fastOperations: string[];
    recommendations: string[];
    performanceScore: number;
  } {
    const allStats = this.getAllStats();
    const operationNames = Object.keys(allStats);
    const totalOperations = operationNames.length;

    const slowOperations: string[] = [];
    const fastOperations: string[] = [];
    const recommendations: string[] = [];

    let totalScore = 0;

    for (const [operationName, stats] of Object.entries(allStats)) {
      if (!stats) continue;

      // Healthcare-specific thresholds
      const thresholds = {
        'fhir-validation': 500,
        'phi-masking': 100,
        'compliance-check': 200,
        'audit-logging': 50,
        'security-validation': 300,
        'default': 1000,
      };

      const threshold = thresholds[operationName as keyof typeof thresholds] || thresholds.default;
      
      if (stats.p95 > threshold) {
        slowOperations.push(operationName);
        recommendations.push(`Optimize ${operationName} - P95: ${stats.p95.toFixed(2)}ms (threshold: ${threshold}ms)`);
      } else {
        fastOperations.push(operationName);
      }

      // Calculate score (0-100) based on performance vs threshold
      const score = Math.max(0, Math.min(100, 100 - (stats.p95 / threshold) * 50));
      totalScore += score;
    }

    const performanceScore = totalOperations > 0 ? totalScore / totalOperations : 100;

    if (performanceScore < 70) {
      recommendations.push('Overall performance needs improvement - consider caching strategies');
    }
    if (slowOperations.length > totalOperations * 0.3) {
      recommendations.push('High percentage of slow operations - review algorithm efficiency');
    }

    return {
      totalOperations,
      slowOperations,
      fastOperations,
      recommendations,
      performanceScore: Math.round(performanceScore),
    };
  }
}

/**
 * Global healthcare performance profiler instance
 */
export const healthcareProfiler = new HealthcarePerformanceProfiler();

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(operationName: string) {
  return function <T extends (...args: unknown[]) => unknown>(
    target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    
    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = (async function (this: unknown, ...args: Parameters<T>) {
      healthcareProfiler.startTimer(operationName);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        healthcareProfiler.endTimer(operationName);
      }
    }) as T;

    return descriptor;
  };
}

/**
 * Monitor frame rate for UI performance
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameRates: number[] = [];
  private isMonitoring = false;
  private animationId?: number;

  /**
   * Start monitoring frame rate
   */
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameRates = [];
    
    const monitor = () => {
      if (!this.isMonitoring) return;
      
      this.frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      
      if (deltaTime >= 1000) { // Calculate FPS every second
        const fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.frameRates.push(fps);
        
        // Keep only last 60 measurements (1 minute of data)
        if (this.frameRates.length > 60) {
          this.frameRates.shift();
        }
        
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      this.animationId = requestAnimationFrame(monitor);
    };
    
    this.animationId = requestAnimationFrame(monitor);
  }

  /**
   * Stop monitoring frame rate
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * Get current average frame rate
   */
  getAverageFrameRate(): number {
    if (this.frameRates.length === 0) return 0;
    return Math.round(this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length);
  }

  /**
   * Check if frame rate is acceptable for healthcare UI
   */
  isPerformanceAcceptable(): boolean {
    const avgFps = this.getAverageFrameRate();
    return avgFps >= 30; // Minimum acceptable for healthcare UIs
  }

  /**
   * Get performance status
   */
  getPerformanceStatus(): 'excellent' | 'good' | 'acceptable' | 'poor' {
    const avgFps = this.getAverageFrameRate();
    if (avgFps >= 55) return 'excellent';
    if (avgFps >= 45) return 'good';  
    if (avgFps >= 30) return 'acceptable';
    return 'poor';
  }
}

/**
 * Global frame rate monitor instance
 */
export const frameRateMonitor = new FrameRateMonitor();
