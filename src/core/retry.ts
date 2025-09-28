/**
 * Retry mechanisms and circuit breaker patterns
 */

import { Logger } from './logger';
import { SDKError, NetworkError, ErrorSeverity } from './errors';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  retryableStatusCodes: number[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface RetryAttempt {
  attempt: number;
  delay: number;
  error: Error;
  timestamp: Date;
}

/**
 * Exponential backoff retry mechanism with jitter
 */
export class RetryManager {
  private config: RetryConfig;
  private logger: Logger;

  constructor(config: Partial<RetryConfig> = {}, logger: Logger) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: ['NETWORK_ERROR', 'NETWORK_500', 'NETWORK_502', 'NETWORK_503', 'NETWORK_504', 'NETWORK_429'],
      retryableStatusCodes: [500, 502, 503, 504, 429],
      ...config
    };
    this.logger = logger.child({ component: 'RetryManager' });
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: { operationName: string; metadata?: Record<string, any> } = { operationName: 'unknown' }
  ): Promise<T> {
    const attempts: RetryAttempt[] = [];
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt);
          this.logger.debug(`Retrying operation ${context.operationName}, attempt ${attempt}/${this.config.maxRetries}, delay: ${delay}ms`);
          await this.sleep(delay);
        }

        const result = await operation();
        
        if (attempts.length > 0) {
          this.logger.info(`Operation ${context.operationName} succeeded after ${attempt} retries`, {
            component: 'RetryManager',
            metadata: {
              attempts: attempts.length,
              totalTime: Date.now() - attempts[0]!.timestamp.getTime()
            }
          });
        }

        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        const retryAttempt: RetryAttempt = {
          attempt,
          delay: attempt > 0 ? this.calculateDelay(attempt) : 0,
          error: lastError,
          timestamp: new Date()
        };
        attempts.push(retryAttempt);

        // Check if error is retryable
        if (!this.isRetryableError(lastError) || attempt >= this.config.maxRetries) {
          this.logger.error(`Operation ${context.operationName} failed after ${attempt + 1} attempts`, {
            attempts: attempts.map(a => ({
              attempt: a.attempt,
              error: a.error.message,
              timestamp: a.timestamp
            })),
            finalError: lastError.message
          });
          break;
        }

        this.logger.warn(`Operation ${context.operationName} failed, attempt ${attempt + 1}/${this.config.maxRetries + 1}`, {
          component: 'RetryManager',
          metadata: {
            error: lastError.message,
            nextRetryIn: this.calculateDelay(attempt + 1)
          }
        });
      }
    }

    throw lastError;
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1),
      this.config.maxDelay
    );

    if (!this.config.jitter) {
      return exponentialDelay;
    }

    // Add jitter to prevent thundering herd
    const jitterRange = exponentialDelay * 0.1;
    const jitter = Math.random() * jitterRange * 2 - jitterRange;
    
    return Math.max(0, exponentialDelay + jitter);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    if (error instanceof SDKError) {
      return this.config.retryableErrors.includes(error.code);
    }

    if (error instanceof NetworkError && error.statusCode) {
      return this.config.retryableStatusCodes.includes(error.statusCode);
    }

    // For generic errors, check message patterns
    const errorMessage = error.message.toLowerCase();
    const retryablePatterns = ['timeout', 'network', 'connection', 'unavailable', 'busy'];
    
    return retryablePatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update retry configuration
   */
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.debug('Retry configuration updated', { 
      component: 'RetryManager',
      metadata: this.config 
    });
  }
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;
  private logger: Logger;
  private stateChangeCallbacks: ((state: CircuitBreakerState) => void)[] = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}, logger: Logger) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 10000,
      halfOpenMaxCalls: 3,
      ...config
    };
    this.logger = logger.child({ component: 'CircuitBreaker' });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'unknown'
  ): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.setState(CircuitBreakerState.HALF_OPEN);
      } else {
        throw new SDKError(
          `Circuit breaker is OPEN for ${operationName}`,
          undefined,
          ErrorSeverity.HIGH,
          'CIRCUIT_BREAKER_OPEN',
          { component: 'CircuitBreaker', operation: operationName }
        );
      }
    }

    if (this.state === CircuitBreakerState.HALF_OPEN && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new SDKError(
        `Circuit breaker HALF_OPEN max calls exceeded for ${operationName}`,
        undefined,
        ErrorSeverity.HIGH,
        'CIRCUIT_BREAKER_HALF_OPEN_LIMIT',
        { component: 'CircuitBreaker', operation: operationName }
      );
    }

    try {
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.halfOpenCalls++;
      }

      const result = await operation();
      this.onSuccess(operationName);
      return result;

    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)), operationName);
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(operationName: string): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.setState(CircuitBreakerState.CLOSED);
      this.halfOpenCalls = 0;
      this.logger.info(`Circuit breaker reset to CLOSED for ${operationName}`);
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: Error, operationName: string): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.setState(CircuitBreakerState.OPEN);
      this.halfOpenCalls = 0;
      this.logger.warn(`Circuit breaker opened from HALF_OPEN due to failure in ${operationName}`, {
        component: 'CircuitBreaker',
        metadata: {
          error: error.message,
          failureCount: this.failureCount
        }
      });
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.setState(CircuitBreakerState.OPEN);
      this.logger.warn(`Circuit breaker opened due to ${this.failureCount} failures in ${operationName}`, {
        component: 'CircuitBreaker',
        metadata: {
          error: error.message,
          threshold: this.config.failureThreshold
        }
      });
    }
  }

  /**
   * Check if circuit breaker should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout;
  }

  /**
   * Set circuit breaker state
   */
  private setState(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;
    
    this.logger.debug(`Circuit breaker state changed from ${oldState} to ${newState}`);
    
    // Notify callbacks
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        this.logger.error('Error in circuit breaker state change callback', error);
      }
    });
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get current metrics
   */
  getMetrics(): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: number;
    halfOpenCalls: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenCalls: this.halfOpenCalls
    };
  }

  /**
   * Register state change callback
   */
  onStateChange(callback: (state: CircuitBreakerState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenCalls = 0;
    this.setState(CircuitBreakerState.CLOSED);
    this.logger.info('Circuit breaker manually reset');
  }
}

/**
 * Combined retry and circuit breaker manager
 */
export class ResilienceManager {
  private retryManager: RetryManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private logger: Logger;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    _circuitBreakerConfig: Partial<CircuitBreakerConfig> = {},
    logger: Logger
  ) {
    this.logger = logger.child({ component: 'ResilienceManager' });
    this.retryManager = new RetryManager(retryConfig, this.logger);
  }

  /**
   * Execute operation with both retry and circuit breaker protection
   */
  async executeWithResilience<T>(
    operation: () => Promise<T>,
    operationName: string,
    circuitBreakerKey?: string
  ): Promise<T> {
    const cbKey = circuitBreakerKey || operationName;
    
    if (!this.circuitBreakers.has(cbKey)) {
      this.circuitBreakers.set(cbKey, new CircuitBreaker({}, this.logger));
    }

    const circuitBreaker = this.circuitBreakers.get(cbKey)!;

    return this.retryManager.execute(
      () => circuitBreaker.execute(operation, operationName),
      { operationName }
    );
  }

  /**
   * Get circuit breaker for a specific key
   */
  getCircuitBreaker(key: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(key);
  }

  /**
   * Get all circuit breaker metrics
   */
  getCircuitBreakerMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.circuitBreakers.forEach((cb, key) => {
      metrics[key] = cb.getMetrics();
    });

    return metrics;
  }
}