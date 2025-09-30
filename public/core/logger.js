/**
 * Logging utilities for the SDK
 */
import pino from 'pino';
export class Logger {
    logger;
    constructor(config) {
        // Create logger with optional transport
        if (config.format === 'text') {
            this.logger = pino({
                level: config.level,
                timestamp: pino.stdTimeFunctions.isoTime,
                formatters: {
                    level: label => ({ level: label }),
                },
            }, pino.transport({
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                },
            }));
        }
        else {
            this.logger = pino({
                level: config.level,
                timestamp: pino.stdTimeFunctions.isoTime,
                formatters: {
                    level: label => ({ level: label }),
                },
            });
        }
    }
    debug(message, ...args) {
        this.logger.debug(message, ...args);
    }
    info(message, ...args) {
        this.logger.info(message, ...args);
    }
    warn(message, ...args) {
        this.logger.warn(message, ...args);
    }
    error(message, error, ...args) {
        if (error instanceof Error) {
            this.logger.error({ err: error, ...args }, message);
        }
        else {
            this.logger.error({ error, ...args }, message);
        }
    }
    child(bindings) {
        const childLogger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
        childLogger.logger = this.logger.child(bindings);
        return childLogger;
    }
}
//# sourceMappingURL=logger.js.map