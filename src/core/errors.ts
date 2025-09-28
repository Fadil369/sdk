/**
 * Comprehensive error handling system for the SDK
 */

export enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  FHIR = 'FHIR',
  NPHIES = 'NPHIES',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  AI = 'AI',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  timestamp: Date;
  component: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'circuit-breaker' | 'ignore';
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: () => Promise<any>;
}

/**
 * Base SDK Error class with enhanced context and recovery
 */
export class SDKError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly cause?: Error;
  public recoveryStrategy?: ErrorRecoveryStrategy;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    context?: Partial<ErrorContext>,
    cause?: Error
  ) {
    super(message);
    this.name = 'SDKError';
    this.category = category;
    this.severity = severity;
    this.code = code || `${category}_ERROR`;
    this.cause = cause;
    this.recoverable = severity !== ErrorSeverity.CRITICAL;
    
    this.context = {
      timestamp: new Date(),
      component: 'SDK',
      ...context
    };

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      code: this.code,
      context: this.context,
      recoverable: this.recoverable,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : undefined
    };
  }
}

/**
 * Configuration-specific errors
 */
export class ConfigurationError extends SDKError {
  constructor(message: string, code?: string, context?: Partial<ErrorContext>, cause?: Error) {
    super(message, ErrorCategory.CONFIGURATION, ErrorSeverity.HIGH, code, context, cause);
    this.name = 'ConfigurationError';
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends SDKError {
  public readonly statusCode?: number;
  public readonly url?: string;

  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    context?: Partial<ErrorContext>,
    cause?: Error
  ) {
    const isRecoverable = statusCode ? statusCode >= 500 || statusCode === 429 : true;
    super(message, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, `NETWORK_${statusCode || 'ERROR'}`, context, cause);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
    // Override recoverable after construction
    Object.defineProperty(this, 'recoverable', { value: isRecoverable, writable: false });
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends SDKError {
  constructor(message: string, code?: string, context?: Partial<ErrorContext>, cause?: Error) {
    super(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, code, context, cause);
    this.name = 'AuthenticationError';
    Object.defineProperty(this, 'recoverable', { value: false, writable: false });
  }
}

/**
 * Validation errors
 */
export class ValidationError extends SDKError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    context?: Partial<ErrorContext>,
    cause?: Error
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, 'VALIDATION_ERROR', context, cause);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    Object.defineProperty(this, 'recoverable', { value: false, writable: false });
  }
}

/**
 * FHIR-specific errors
 */
export class FHIRError extends SDKError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string,
    context?: Partial<ErrorContext>,
    cause?: Error
  ) {
    super(message, ErrorCategory.FHIR, ErrorSeverity.MEDIUM, 'FHIR_ERROR', context, cause);
    this.name = 'FHIRError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * NPHIES-specific errors
 */
export class NPHIESError extends SDKError {
  public readonly submissionId?: string;
  public readonly outcomeCode?: string;

  constructor(
    message: string,
    submissionId?: string,
    outcomeCode?: string,
    context?: Partial<ErrorContext>,
    cause?: Error
  ) {
    super(message, ErrorCategory.NPHIES, ErrorSeverity.MEDIUM, `NPHIES_${outcomeCode || 'ERROR'}`, context, cause);
    this.name = 'NPHIESError';
    this.submissionId = submissionId;
    this.outcomeCode = outcomeCode;
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends SDKError {
  constructor(message: string, code?: string, context?: Partial<ErrorContext>, cause?: Error) {
    super(message, ErrorCategory.SECURITY, ErrorSeverity.CRITICAL, code, context, cause);
    this.name = 'SecurityError';
    Object.defineProperty(this, 'recoverable', { value: false, writable: false });
  }
}

/**
 * Centralized error handler with recovery strategies
 */
export class ErrorHandler {
  private errorCallbacks: ((error: SDKError) => void)[] = [];
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();

  /**
   * Register an error callback
   */
  onError(callback: (error: SDKError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Register a recovery strategy for specific error types
   */
  setRecoveryStrategy(errorCode: string, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(errorCode, strategy);
  }

  /**
   * Handle an error with potential recovery
   */
  async handleError(error: Error | SDKError, context?: Partial<ErrorContext>): Promise<any> {
    let sdkError: SDKError;

    if (error instanceof SDKError) {
      sdkError = error;
      // Merge additional context
      if (context) {
        sdkError.context.metadata = { ...sdkError.context.metadata, ...context };
      }
    } else {
      sdkError = new SDKError(
        error.message,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        undefined,
        context,
        error
      );
    }

    // Notify error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(sdkError);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });

    // Attempt recovery if possible
    if (sdkError.recoverable) {
      const strategy = this.recoveryStrategies.get(sdkError.code) || sdkError.recoveryStrategy;
      if (strategy) {
        return this.executeRecoveryStrategy(sdkError, strategy);
      }
    }

    throw sdkError;
  }

  /**
   * Execute recovery strategy
   */
  private async executeRecoveryStrategy(error: SDKError, strategy: ErrorRecoveryStrategy): Promise<any> {
    switch (strategy.type) {
      case 'retry':
        // Retry logic will be handled by the retry mechanism
        throw error;
      
      case 'fallback':
        if (strategy.fallbackAction) {
          try {
            return await strategy.fallbackAction();
          } catch (fallbackError) {
            // If fallback fails, throw original error
            throw error;
          }
        }
        throw error;
      
      case 'circuit-breaker':
        // Circuit breaker logic will be handled by the circuit breaker
        throw error;
      
      case 'ignore':
        return null;
      
      default:
        throw error;
    }
  }

  /**
   * Create error from HTTP response
   */
  static fromHttpError(
    error: any,
    url?: string,
    context?: Partial<ErrorContext>
  ): NetworkError {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Network error occurred';
    
    return new NetworkError(message, statusCode, url, context, error);
  }

  /**
   * Create validation error with field details
   */
  static createValidationError(
    message: string,
    field?: string,
    value?: any,
    context?: Partial<ErrorContext>
  ): ValidationError {
    return new ValidationError(message, field, value, context);
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler();