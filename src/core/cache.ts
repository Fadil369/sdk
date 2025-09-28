/**
 * Cache Manager for the BrainSAIT Healthcare SDK
 */

import { SDKConfig } from '@/types/config';
import { Logger } from './logger';

export class CacheManager {
  private config: SDKConfig;
  private logger: Logger;
  private enabled: boolean;
  private cache: Map<string, { value: unknown; expires: number }> = new Map();

  constructor(config: SDKConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.enabled = config.caching?.enabled || false;
  }

  get<T>(key: string): T | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const item = this.cache.get(key);
    if (item && item.expires > Date.now()) {
      this.logger.info(`Cache hit for key: ${key}`);
      return item.value as T;
    }

    this.logger.info(`Cache miss for key: ${key}`);
    return undefined;
  }

  set<T>(key: string, value: T, ttl: number): void {
    if (!this.enabled) {
      return;
    }

    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
    this.logger.info(`Cache set for key: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  healthCheck(): { status: string } {
    return {
      status: this.enabled ? 'enabled' : 'disabled',
    };
  }
}