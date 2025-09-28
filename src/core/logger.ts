/**
 * Logging utilities for the SDK
 */

import pino from 'pino';

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputs: ('console' | 'file' | 'remote')[];
}

export class Logger {
  private logger: pino.Logger;

  constructor(config: LoggingConfig) {
    // Create logger with optional transport
    if (config.format === 'text') {
      this.logger = pino(
        {
          level: config.level,
          timestamp: pino.stdTimeFunctions.isoTime,
          formatters: {
            level: label => ({ level: label }),
          },
        },
        pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }) as pino.DestinationStream
      );
    } else {
      this.logger = pino({
        level: config.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: label => ({ level: label }),
        },
      });
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...args }, message);
    } else {
      this.logger.error({ error, ...args }, message);
    }
  }

  child(bindings: Record<string, unknown>): Logger {
    const childLogger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }
}
