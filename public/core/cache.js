/**
 * Cache Manager for the BrainSAIT Healthcare SDK
 */
export class CacheManager {
    config;
    logger;
    enabled;
    cache = new Map();
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.enabled = config.caching?.enabled || false;
    }
    get(key) {
        if (!this.enabled) {
            return undefined;
        }
        const item = this.cache.get(key);
        if (item && item.expires > Date.now()) {
            this.logger.info(`Cache hit for key: ${key}`);
            return item.value;
        }
        this.logger.info(`Cache miss for key: ${key}`);
        return undefined;
    }
    set(key, value, ttl) {
        if (!this.enabled) {
            return;
        }
        const expires = Date.now() + ttl;
        this.cache.set(key, { value, expires });
        this.logger.info(`Cache set for key: ${key}`);
    }
    clear() {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }
    healthCheck() {
        return {
            status: this.enabled ? 'enabled' : 'disabled',
        };
    }
}
