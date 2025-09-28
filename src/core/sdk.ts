/**
 * Main BrainSAIT Healthcare SDK class
 */

import { SDKConfig, SDKInitOptions, PerformanceMetrics } from '@/types/config';
import { ConfigManager } from './config';
import { Logger } from './logger';
import { ApiClient } from './client';
import { PerformanceMonitor } from './performance';
import { LegacyFHIRClient as FHIRClient } from '@/fhir';
import { NPHIESClient } from '@/nphies';
import { SecurityManager } from '@/security';
import { AIAgentManager } from '@/ai';
import { AnalyticsManager } from './analytics';
import { CacheManager } from './cache';

export class BrainSAITHealthcareSDK {
  private config: ConfigManager;
  private logger: Logger;
  private apiClient: ApiClient;
  private performanceMonitor: PerformanceMonitor;
  private fhirClient: FHIRClient;
  private nphiesClient: NPHIESClient;
  private securityManager: SecurityManager;
  private aiManager: AIAgentManager;
  private analyticsManager: AnalyticsManager;
  private cacheManager: CacheManager;
  private initialized = false;

  constructor(options: SDKInitOptions = {}) {
    this.config = new ConfigManager(options);
    this.logger = new Logger(this.config.get('logging'));
    this.apiClient = new ApiClient(this.config, this.logger);
    this.performanceMonitor = new PerformanceMonitor(
      this.config.get('ui.performance'),
      options.onPerformanceMetric
    );

    // Initialize specialized clients
    this.fhirClient = new FHIRClient(this.config, this.logger, this.apiClient);
    this.nphiesClient = new NPHIESClient(this.config, this.logger, this.apiClient);
    this.securityManager = new SecurityManager(this.config, this.logger);
    this.aiManager = new AIAgentManager(this.config, this.logger);
    this.analyticsManager = new AnalyticsManager(this.config.getAll(), this.logger);
    this.cacheManager = new CacheManager(this.config.getAll(), this.logger);

    // Set error handler
    if (options.onError) {
      this.setErrorHandler(options.onError);
    }
  }

  /**
   * Initialize the SDK with configuration validation
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('SDK is already initialized');
    }

    try {
      this.logger.info('Initializing BrainSAIT Healthcare SDK...');

      // Validate configuration
      this.config.validate();

      // Initialize performance monitoring
      this.performanceMonitor.start();

      // Initialize security manager
      await this.securityManager.initialize();

      // Initialize clients
      await this.fhirClient.initialize();
      await this.nphiesClient.initialize();

      // Initialize AI agents if enabled
      if (this.config.get('ai.enabled')) {
        await this.aiManager.initialize();
      }

      this.initialized = true;
      this.logger.info('SDK initialized successfully');
    } catch (error) {
      this.logger.error(
        'Failed to initialize SDK',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Get FHIR client instance
   */
  get fhir(): FHIRClient {
    this.ensureInitialized();
    return this.fhirClient;
  }

  /**
   * Get FHIR client instance (alternative method)
   */
  getFHIRClient(): FHIRClient {
    this.ensureInitialized();
    return this.fhirClient;
  }

  /**
   * Get NPHIES client instance
   */
  get nphies(): NPHIESClient {
    this.ensureInitialized();
    return this.nphiesClient;
  }

  /**
   * Get NPHIES client instance (alternative method)
   */
  getNPHIESClient(): NPHIESClient {
    this.ensureInitialized();
    return this.nphiesClient;
  }

  /**
   * Get security manager instance
   */
  get security(): SecurityManager {
    this.ensureInitialized();
    return this.securityManager;
  }

  /**
   * Get security manager instance (alternative method)
   */
  getSecurityManager(): SecurityManager {
    this.ensureInitialized();
    return this.securityManager;
  }

  /**
   * Get AI agent manager instance
   */
  get ai(): AIAgentManager {
    this.ensureInitialized();
    return this.aiManager;
  }

  /**
   * Get AI agent manager instance (alternative method)
   */
  getAIAgentManager(): AIAgentManager {
    this.ensureInitialized();
    return this.aiManager;
  }

  /**
   * Get analytics manager instance
   */
  get analytics(): AnalyticsManager {
    this.ensureInitialized();
    return this.analyticsManager;
  }

  /**
   * Get analytics manager instance (alternative method)
   */
  getAnalyticsManager(): AnalyticsManager {
    this.ensureInitialized();
    return this.analyticsManager;
  }

  /**
   * Get cache manager instance
   */
  get cache(): CacheManager {
    this.ensureInitialized();
    return this.cacheManager;
  }

  /**
   * Get cache manager instance (alternative method)
   */
  getCacheManager(): CacheManager {
    this.ensureInitialized();
    return this.cacheManager;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Update SDK configuration
   */
  updateConfig(newConfig: Partial<SDKConfig>): void {
    this.config.update(newConfig);
    this.logger.info('Configuration updated');
  }

  /**
   * Get health status of the SDK and connected services
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    responseTime: number;
    services: Record<string, unknown>;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const [fhirHealth, nphiesHealth] = await Promise.allSettled([
        this.fhirClient.healthCheck(),
        this.nphiesClient.healthCheck(),
      ]);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        responseTime: Date.now() - startTime,
        services: {
          fhir:
            fhirHealth.status === 'fulfilled'
              ? fhirHealth.value
              : { status: 'down', error: String(fhirHealth.reason) },
          nphies:
            nphiesHealth.status === 'fulfilled'
              ? nphiesHealth.value
              : { status: 'down', error: String(nphiesHealth.reason) },
          security: await this.securityManager.healthCheck(),
          ai: this.config.get<{ enabled: boolean }>('ai')?.enabled
            ? await this.aiManager.healthCheck()
            : { status: 'disabled' },
          analytics: this.analyticsManager.healthCheck(),
          cache: this.cacheManager.healthCheck(),
        },
      };
    } catch (error) {
      this.logger.error(
        'Health check failed',
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        responseTime: Date.now() - startTime,
        services: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Alias for health check (for compatibility)
   */
  async getHealthStatus() {
    return this.healthCheck();
  }

  /**
   * Cleanup resources and shut down the SDK
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.logger.info('Shutting down SDK...');

    try {
      await this.performanceMonitor.stop();
      await this.aiManager.shutdown();
      await this.securityManager.shutdown();
      await this.nphiesClient.shutdown();
      await this.fhirClient.shutdown();

      this.initialized = false;
      this.logger.info('SDK shutdown completed');
    } catch (error) {
      this.logger.error(
        'Error during shutdown',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
  }

  private setErrorHandler(handler: (error: Error) => void): void {
    process.on('unhandledRejection', handler);
    process.on('uncaughtException', handler);
  }
}
