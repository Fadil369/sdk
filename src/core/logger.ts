/**
 * Enhanced logging utilities for the SDK with structured metadata and correlation IDs
 */

import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputs: ('console' | 'file' | 'remote')[];
  enableCorrelationId?: boolean;
  enableAuditTrail?: boolean;
  enablePerformanceMarkers?: boolean;
  redactionPaths?: string[];
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  timestamp: Date;
  level: string;
  message: string;
  context: LogContext;
  sensitive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Enhanced Logger with structured metadata, correlation IDs, and audit trails
 */
export class Logger {
  private logger: pino.Logger;
  private config: LoggingConfig;
  private performanceMarkers: Map<string, PerformanceMarker> = new Map();
  private auditTrail: AuditLogEntry[] = [];
  private correlationId?: string;

  constructor(config: LoggingConfig) {
    this.config = {
      enableCorrelationId: true,
      enableAuditTrail: true,
      enablePerformanceMarkers: true,
      redactionPaths: ['password', 'token', 'secret', 'key', 'authorization'],
      ...config
    };

    const transport = this.config.format === 'text' 
      ? pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'correlationId,component',
          }
        })
      : undefined;

    this.logger = pino({
      level: this.config.level,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
      },
      redact: {
        paths: this.config.redactionPaths || [],
        censor: '[REDACTED]'
      },
      base: {
        pid: process.pid,
        hostname: process.env.HOSTNAME || 'localhost',
        service: 'brainsait-healthcare-sdk',
        version: '1.0.0'
      }
    }, transport);

    // Set correlation ID if enabled
    if (this.config.enableCorrelationId) {
      this.correlationId = uuidv4();
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: Record<string, any>): Logger {
    const childLogger = new Logger({
      level: this.config.level,
      format: this.config.format,
      outputs: this.config.outputs,
      enableCorrelationId: this.config.enableCorrelationId,
      enableAuditTrail: this.config.enableAuditTrail,
      enablePerformanceMarkers: this.config.enablePerformanceMarkers,
      redactionPaths: this.config.redactionPaths
    });
    
    childLogger.logger = this.logger.child({
      ...bindings,
      correlationId: this.correlationId
    });
    childLogger.correlationId = this.correlationId;
    
    return childLogger;
  }

  /**
   * Set correlation ID for request tracing
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
    this.logger = this.logger.child({ correlationId });
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string | undefined {
    return this.correlationId;
  }

  /**
   * Debug level logging with context
   */
  debug(message: string, context?: LogContext, ...args: any[]): void {
    const logData = this.prepareLogData(context, args);
    this.logger.debug(logData, message);
    this.addToAuditTrail('debug', message, context, false);
  }

  /**
   * Info level logging with context
   */
  info(message: string, context?: LogContext, ...args: any[]): void {
    const logData = this.prepareLogData(context, args);
    this.logger.info(logData, message);
    this.addToAuditTrail('info', message, context, false);
  }

  /**
   * Warning level logging with context
   */
  warn(message: string, context?: LogContext, ...args: any[]): void {
    const logData = this.prepareLogData(context, args);
    this.logger.warn(logData, message);
    this.addToAuditTrail('warn', message, context, false);
  }

  /**
   * Error level logging with context
   */
  error(message: string, error?: Error | any, context?: LogContext, ...args: any[]): void {
    const logData = this.prepareLogData(context, args);
    
    if (error instanceof Error) {
      logData.err = error;
      logData.errorStack = error.stack;
      logData.errorCode = (error as any).code;
    } else if (error) {
      logData.error = error;
    }

    this.logger.error(logData, message);
    this.addToAuditTrail('error', message, context, false);
  }

  /**
   * Log sensitive audit information (HIPAA compliance)
   */
  audit(message: string, context?: LogContext, sensitive: boolean = true): void {
    const logData = this.prepareLogData(context);
    logData.audit = true;
    logData.sensitive = sensitive;
    
    this.logger.info(logData, `[AUDIT] ${message}`);
    this.addToAuditTrail('audit', message, context, sensitive);
  }

  /**
   * Start performance marker
   */
  startPerformance(name: string, metadata?: Record<string, any>): void {
    if (!this.config.enablePerformanceMarkers) return;

    const marker: PerformanceMarker = {
      name,
      startTime: Date.now(),
      metadata
    };

    this.performanceMarkers.set(name, marker);
    this.debug(`Performance marker started: ${name}`, { operation: 'performance_start' });
  }

  /**
   * End performance marker and log duration
   */
  endPerformance(name: string, metadata?: Record<string, any>): number | undefined {
    if (!this.config.enablePerformanceMarkers) return;

    const marker = this.performanceMarkers.get(name);
    if (!marker) {
      this.warn(`Performance marker not found: ${name}`, { operation: 'performance_end' });
      return;
    }

    marker.endTime = Date.now();
    marker.duration = marker.endTime - marker.startTime;
    marker.metadata = { ...marker.metadata, ...metadata };

    this.info(`Performance marker completed: ${name}`, {
      operation: 'performance_end',
      metadata: {
        duration: marker.duration,
        ...marker.metadata
      }
    });

    this.performanceMarkers.delete(name);
    return marker.duration;
  }

  /**
   * Log performance metric
   */
  performance(name: string, duration: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${name}`, {
      operation: 'performance_metric',
      metadata: {
        duration,
        ...metadata
      }
    });
  }

  /**
   * Get audit trail (last N entries)
   */
  getAuditTrail(limit: number = 100): AuditLogEntry[] {
    return this.auditTrail.slice(-limit);
  }

  /**
   * Clear audit trail
   */
  clearAuditTrail(): void {
    this.auditTrail = [];
  }

  /**
   * Get active performance markers
   */
  getActivePerformanceMarkers(): PerformanceMarker[] {
    return Array.from(this.performanceMarkers.values());
  }

  /**
   * Prepare log data with context and correlation
   */
  private prepareLogData(context?: LogContext, args: any[] = []): Record<string, any> {
    const logData: Record<string, any> = {};

    // Add correlation ID
    if (this.correlationId) {
      logData.correlationId = this.correlationId;
    }

    // Add context
    if (context) {
      Object.assign(logData, context);
    }

    // Add additional arguments
    if (args.length > 0) {
      logData.args = args;
    }

    return logData;
  }

  /**
   * Add entry to audit trail
   */
  private addToAuditTrail(level: string, message: string, context?: LogContext, sensitive?: boolean): void {
    if (!this.config.enableAuditTrail) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: context || {},
      sensitive: sensitive || false
    };

    this.auditTrail.push(entry);

    // Keep audit trail size manageable
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-500); // Keep last 500 entries
    }
  }

  /**
   * Flush any pending logs (useful for graceful shutdown)
   */
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.flush((err) => {
        if (err) {
          console.error('Error flushing logs:', err);
        }
        resolve();
      });
    });
  }
}