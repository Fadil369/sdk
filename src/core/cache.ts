/**
 * Caching strategies and implementations
 */

import { Logger } from './logger';

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  checkPeriod: number;
  enableMetrics: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  hits: number;
  created: number;
  lastAccessed: number;
}

export interface CacheMetrics {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  averageAge: number;
}

export interface CacheStrategy {
  shouldEvict(entry: CacheEntry<any>, currentTime: number): boolean;
  onHit(entry: CacheEntry<any>): void;
  onMiss(key: string): void;
  onSet(key: string, entry: CacheEntry<any>): void;
  onEvict(key: string, entry: CacheEntry<any>): void;
}

/**
 * LRU (Least Recently Used) Cache Strategy
 */
export class LRUStrategy implements CacheStrategy {
  private accessOrder: string[] = [];

  shouldEvict(entry: CacheEntry<any>, currentTime: number): boolean {
    return entry.expiry <= currentTime;
  }

  onHit(entry: CacheEntry<any>): void {
    entry.hits++;
    entry.lastAccessed = Date.now();
  }

  onMiss(key: string): void {
    // Remove from access order if it was there
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  onSet(_key: string, _entry: CacheEntry<any>): void {
    // Remove existing entry from order
    const index = this.accessOrder.indexOf(_key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    // Add to end (most recently used)
    this.accessOrder.push(_key);
  }

  onEvict(key: string, _entry: CacheEntry<any>): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  getLeastRecentlyUsed(): string | undefined {
    return this.accessOrder[0];
  }

  getAccessOrder(): string[] {
    return [...this.accessOrder];
  }
}

/**
 * TTL (Time To Live) Cache Strategy
 */
export class TTLStrategy implements CacheStrategy {
  shouldEvict(entry: CacheEntry<any>, currentTime: number): boolean {
    return entry.expiry <= currentTime;
  }

  onHit(entry: CacheEntry<any>): void {
    entry.hits++;
    entry.lastAccessed = Date.now();
  }

  onMiss(_key: string): void {
    // No specific action needed for TTL strategy
  }

  onSet(_key: string, _entry: CacheEntry<any>): void {
    // No specific action needed for TTL strategy
  }

  onEvict(_key: string, _entry: CacheEntry<any>): void {
    // No specific action needed for TTL strategy
  }
}

/**
 * In-memory cache implementation with multiple strategies
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private strategy: CacheStrategy;
  private logger: Logger;
  private metrics: CacheMetrics;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    config: Partial<CacheConfig> = {},
    strategy: CacheStrategy = new LRUStrategy(),
    logger: Logger
  ) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 300000, // 5 minutes
      checkPeriod: 60000,  // 1 minute
      enableMetrics: true,
      ...config
    };
    
    this.strategy = strategy;
    this.logger = logger.child({ component: 'MemoryCache' });
    
    this.metrics = {
      size: 0,
      maxSize: this.config.maxSize,
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0,
      averageAge: 0
    };

    // Start cleanup interval
    if (this.config.checkPeriod > 0) {
      this.startCleanup();
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    const currentTime = Date.now();

    if (!entry) {
      this.recordMiss(key);
      return undefined;
    }

    if (this.strategy.shouldEvict(entry, currentTime)) {
      this.delete(key);
      this.recordMiss(key);
      return undefined;
    }

    this.recordHit(entry);
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const currentTime = Date.now();
    const timeToLive = ttl ?? this.config.defaultTtl;

    const entry: CacheEntry<T> = {
      value,
      expiry: currentTime + timeToLive,
      hits: 0,
      created: currentTime,
      lastAccessed: currentTime
    };

    // Check if we need to evict to make space
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOne();
    }

    this.cache.set(key, entry);
    this.strategy.onSet(key, entry);
    this.updateMetrics();

    this.logger.debug(`Cache set: ${key}`, {
      metadata: { ttl: timeToLive, cacheSize: this.cache.size }
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    const deleted = this.cache.delete(key);
    
    if (deleted && entry) {
      this.strategy.onEvict(key, entry);
      this.updateMetrics();
      this.logger.debug(`Cache delete: ${key}`);
    }

    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const currentTime = Date.now();
    if (this.strategy.shouldEvict(entry, currentTime)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.updateMetrics();
    this.logger.info(`Cache cleared: ${size} entries removed`);
  }

  /**
   * Get or set with async function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const value = await factory();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.logger.warn(`Cache factory failed for key: ${key}`, { metadata: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Manually trigger cleanup
   */
  cleanup(): number {
    const currentTime = Date.now();
    let evicted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.strategy.shouldEvict(entry, currentTime)) {
        this.cache.delete(key);
        this.strategy.onEvict(key, entry);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.metrics.evictions += evicted;
      this.updateMetrics();
      this.logger.debug(`Cache cleanup: ${evicted} entries evicted`);
    }

    return evicted;
  }

  /**
   * Warm cache with data
   */
  async warm(warmupData: Record<string, () => Promise<any>>): Promise<void> {
    const promises = Object.entries(warmupData).map(async ([key, factory]) => {
      try {
        const value = await factory();
        this.set(key, value);
        return { key, success: true };
      } catch (error) {
        this.logger.warn(`Cache warming failed for key: ${key}`, { metadata: { error: error instanceof Error ? error.message : String(error) } });
        return { key, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    this.logger.info(`Cache warming completed: ${successful}/${results.length} entries loaded`);
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
    this.logger.info('Cache destroyed');
  }

  /**
   * Record cache hit
   */
  private recordHit(entry: CacheEntry<any>): void {
    this.strategy.onHit(entry);
    if (this.config.enableMetrics) {
      this.metrics.hits++;
    }
  }

  /**
   * Record cache miss
   */
  private recordMiss(key: string): void {
    this.strategy.onMiss(key);
    if (this.config.enableMetrics) {
      this.metrics.misses++;
    }
  }

  /**
   * Evict one entry to make space
   */
  private evictOne(): void {
    if (this.strategy instanceof LRUStrategy) {
      const lru = this.strategy.getLeastRecentlyUsed();
      if (lru) {
        this.delete(lru);
        this.metrics.evictions++;
      }
    } else {
      // For TTL strategy, evict first expired entry or oldest
      const currentTime = Date.now();
      let oldestKey: string | undefined;
      let oldestTime = Infinity;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry <= currentTime) {
          this.delete(key);
          this.metrics.evictions++;
          return;
        }
        if (entry.created < oldestTime) {
          oldestTime = entry.created;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.delete(oldestKey);
        this.metrics.evictions++;
      }
    }
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(): void {
    if (!this.config.enableMetrics) return;

    this.metrics.size = this.cache.size;
    this.metrics.hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? this.metrics.hits / (this.metrics.hits + this.metrics.misses) 
      : 0;

    // Calculate average age
    const currentTime = Date.now();
    let totalAge = 0;
    
    for (const entry of this.cache.values()) {
      totalAge += currentTime - entry.created;
    }
    
    this.metrics.averageAge = this.cache.size > 0 ? totalAge / this.cache.size : 0;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod);
  }
}

/**
 * Cache manager for multiple named caches
 */
export class CacheManager {
  private caches: Map<string, MemoryCache> = new Map();
  private logger: Logger;
  private defaultConfig: CacheConfig;

  constructor(defaultConfig: Partial<CacheConfig> = {}, logger: Logger) {
    this.logger = logger.child({ component: 'CacheManager' });
    this.defaultConfig = {
      maxSize: 1000,
      defaultTtl: 300000,
      checkPeriod: 60000,
      enableMetrics: true,
      ...defaultConfig
    };
  }

  /**
   * Get or create cache
   */
  getCache(
    name: string, 
    config?: Partial<CacheConfig>, 
    strategy?: CacheStrategy
  ): MemoryCache {
    if (!this.caches.has(name)) {
      const cacheConfig = { ...this.defaultConfig, ...config };
      const cache = new MemoryCache(cacheConfig, strategy, this.logger);
      this.caches.set(name, cache);
      this.logger.info(`Cache created: ${name}`, { metadata: cacheConfig });
    }

    return this.caches.get(name)!;
  }

  /**
   * Remove cache
   */
  removeCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      this.caches.delete(name);
      this.logger.info(`Cache removed: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get all cache metrics
   */
  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      metrics[name] = cache.getMetrics();
    }

    return metrics;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const [name, cache] of this.caches.entries()) {
      cache.clear();
      this.logger.info(`Cache cleared: ${name}`);
    }
  }

  /**
   * Destroy all caches
   */
  destroyAll(): void {
    for (const [name, cache] of this.caches.entries()) {
      cache.destroy();
      this.logger.info(`Cache destroyed: ${name}`);
    }
    this.caches.clear();
  }

  /**
   * Get cache names
   */
  getCacheNames(): string[] {
    return Array.from(this.caches.keys());
  }
}