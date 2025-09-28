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
    const transport =
      config.format === 'text'
        ? pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          })
        : undefined;

    this.logger = pino(
      {
        level: config.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: label => ({ level: label }),
        },
      },
      transport
    );
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...args }, message);
    } else {
      this.logger.error({ error, ...args }, message);
    }
  }

  child(bindings: Record<string, any>): Logger {
    const childLogger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }
}
