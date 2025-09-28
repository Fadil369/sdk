/**
 * Enhanced configuration management for the SDK
 */

import { SDKConfig, SDKInitOptions } from '@/types/config';
import { ConfigurationError } from './errors';
import Joi from 'joi';

const configSchema = Joi.object({
  environment: Joi.string().valid('development', 'staging', 'production').default('development'),
  api: Joi.object({
    baseUrl: Joi.string().uri().required(),
    timeout: Joi.number().min(1000).max(60000).default(30000),
    retries: Joi.number().min(0).max(5).default(3),
    rateLimit: Joi.object({
      requests: Joi.number().min(1).default(100),
      window: Joi.number().min(1).default(60),
    }).optional(),
  }).required(),
  fhir: Joi.object({
    serverUrl: Joi.string().uri().required(),
    version: Joi.string().valid('R4', 'R5').default('R4'),
    authentication: Joi.object({
      type: Joi.string().valid('oauth2', 'basic', 'bearer').required(),
      credentials: Joi.object().required(),
    }).optional(),
  }).required(),
  nphies: Joi.object({
    baseUrl: Joi.string().uri().required(),
    clientId: Joi.string().required(),
    clientSecret: Joi.string().optional(),
    scope: Joi.array().items(Joi.string()).default(['read', 'write']),
    sandbox: Joi.boolean().default(true),
  }).required(),
  security: Joi.object({
    encryption: Joi.object({
      algorithm: Joi.string().default('AES-256-GCM'),
      keySize: Joi.number().valid(128, 192, 256).default(256),
    }).required(),
    audit: Joi.object({
      enabled: Joi.boolean().default(true),
      endpoint: Joi.string().uri().optional(),
    }).required(),
    hipaa: Joi.object({
      enabled: Joi.boolean().default(true),
      auditLevel: Joi.string().valid('minimal', 'standard', 'comprehensive').default('standard'),
    }).required(),
  }).required(),
  localization: Joi.object({
    defaultLanguage: Joi.string().valid('ar', 'en').default('ar'),
    supportedLanguages: Joi.array().items(Joi.string()).default(['ar', 'en']),
    rtl: Joi.boolean().default(true),
  }).required(),
  ai: Joi.object({
    enabled: Joi.boolean().default(false),
    providers: Joi.object({
      nlp: Joi.object({
        endpoint: Joi.string().uri().required(),
        model: Joi.string().required(),
      }).optional(),
      analytics: Joi.object({
        endpoint: Joi.string().uri().required(),
        model: Joi.string().required(),
      }).optional(),
    }).required(),
  }).required(),
  ui: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
    glassMorphism: Joi.object({
      enabled: Joi.boolean().default(true),
      opacity: Joi.number().min(0).max(1).default(0.1),
      blur: Joi.number().min(0).max(50).default(20),
    }).required(),
    performance: Joi.object({
      targetFps: Joi.number().min(30).max(120).default(60),
      lazyLoading: Joi.boolean().default(true),
      virtualScrolling: Joi.boolean().default(true),
    }).required(),
  }).required(),
  logging: Joi.object({
    level: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
    format: Joi.string().valid('json', 'text').default('json'),
    outputs: Joi.array().items(Joi.string().valid('console', 'file', 'remote')).default(['console']),
  }).required(),
});

export class ConfigManager {
  private config: SDKConfig;
  private validator: ((config: SDKConfig) => boolean) | undefined;
  private configHistory: SDKConfig[] = [];
  private validationHooks: ((config: SDKConfig) => Promise<void>)[] = [];
  private changeListeners: ((path: string, newValue: any, oldValue: any) => void)[] = [];

  constructor(options: SDKInitOptions = {}) {
    this.validator = options.validator;
    this.config = this.createDefaultConfig();
    
    if (options) {
      this.update(options);
    }
  }

  /**
   * Get configuration value by path
   */
  get<T = any>(path: string): T {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new ConfigurationError(`Configuration key '${path}' not found`, 'CONFIG_KEY_NOT_FOUND');
      }
    }
    
    return value as T;
  }

  /**
   * Set configuration value by path
   */
  set(path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: any = this.config;
    
    // Navigate to parent object
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // Notify listeners
    this.notifyChangeListeners(path, value, oldValue);
  }

  /**
   * Update configuration with advanced merging
   */
  update(newConfig: Partial<SDKConfig>): void {
    // Store current config in history
    this.configHistory.push(JSON.parse(JSON.stringify(this.config)));
    
    // Keep only last 10 configs in history
    if (this.configHistory.length > 10) {
      this.configHistory.shift();
    }

    const oldConfig = JSON.parse(JSON.stringify(this.config));
    this.config = this.mergeConfig(this.config, newConfig);
    
    // Detect changes and notify listeners
    this.detectAndNotifyChanges(oldConfig, this.config);
  }

  /**
   * Enhanced validation with detailed error reporting
   */
  async validate(): Promise<void> {
    try {
      // Schema validation
      const { error, value } = configSchema.validate(this.config, {
        abortEarly: false,
        allowUnknown: false,
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          path: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        throw new ConfigurationError(
          `Configuration validation failed: ${error.message}`,
          'CONFIG_VALIDATION_FAILED',
          { 
            component: 'ConfigManager', 
            metadata: { validationErrors }
          }
        );
      }

      this.config = value;

      // Run validation hooks
      for (const hook of this.validationHooks) {
        await hook(this.config);
      }

      // Custom validation if provided
      if (this.validator && !this.validator(this.config)) {
        throw new ConfigurationError(
          'Custom configuration validation failed',
          'CUSTOM_VALIDATION_FAILED',
          { component: 'ConfigManager' }
        );
      }

    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONFIG_VALIDATION_ERROR',
        { component: 'ConfigManager' },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Add validation hook
   */
  addValidationHook(hook: (config: SDKConfig) => Promise<void>): void {
    this.validationHooks.push(hook);
  }

  /**
   * Add change listener
   */
  addChangeListener(listener: (path: string, newValue: any, oldValue: any) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Get configuration backup (last saved state)
   */
  getBackup(index: number = 0): SDKConfig | undefined {
    const historyIndex = this.configHistory.length - 1 - index;
    return historyIndex >= 0 ? this.configHistory[historyIndex] : undefined;
  }

  /**
   * Restore configuration from backup
   */
  restoreFromBackup(index: number = 0): boolean {
    const backup = this.getBackup(index);
    if (backup) {
      this.config = JSON.parse(JSON.stringify(backup));
      return true;
    }
    return false;
  }

  /**
   * Get configuration differences between current and backup
   */
  getConfigDiff(backupIndex: number = 0): Record<string, { old: any; new: any }> {
    const backup = this.getBackup(backupIndex);
    if (!backup) return {};

    return this.deepDiff(backup, this.config);
  }

  /**
   * Validate specific configuration section
   */
  async validateSection(sectionPath: string): Promise<void> {
    const sectionValue = this.get(sectionPath);
    const sectionSchema = this.getSectionSchema(sectionPath);
    
    if (sectionSchema) {
      const { error } = sectionSchema.validate(sectionValue);
      if (error) {
        throw new ConfigurationError(
          `Section '${sectionPath}' validation failed: ${error.message}`,
          'SECTION_VALIDATION_FAILED',
          { 
            component: 'ConfigManager', 
            metadata: { section: sectionPath }
          }
        );
      }
    }
  }

  /**
   * Hot reload configuration from environment or external source
   */
  async hotReload(_source?: 'env' | 'file' | 'external'): Promise<void> {
    // This is a placeholder for hot reloading functionality
    // In a real implementation, this would load from the specified source
    throw new Error('Hot reload not implemented yet');
  }

  /**
   * Get full configuration
   */
  getAll(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Deep merge two configuration objects
   */
  private mergeConfig(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Notify change listeners
   */
  private notifyChangeListeners(path: string, newValue: any, oldValue: any): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(path, newValue, oldValue);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }

  /**
   * Detect changes between old and new config
   */
  private detectAndNotifyChanges(oldConfig: any, newConfig: any, path: string = ''): void {
    for (const key in newConfig) {
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = oldConfig[key];
      const newValue = newConfig[key];

      if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
        this.detectAndNotifyChanges(oldValue || {}, newValue, currentPath);
      } else if (oldValue !== newValue) {
        this.notifyChangeListeners(currentPath, newValue, oldValue);
      }
    }
  }

  /**
   * Deep diff between two objects
   */
  private deepDiff(obj1: any, obj2: any, path: string = ''): Record<string, { old: any; new: any }> {
    const diff: Record<string, { old: any; new: any }> = {};

    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = obj1?.[key];
      const newValue = obj2?.[key];

      if (typeof oldValue === 'object' && typeof newValue === 'object' && 
          oldValue !== null && newValue !== null && 
          !Array.isArray(oldValue) && !Array.isArray(newValue)) {
        const nestedDiff = this.deepDiff(oldValue, newValue, currentPath);
        Object.assign(diff, nestedDiff);
      } else if (oldValue !== newValue) {
        diff[currentPath] = { old: oldValue, new: newValue };
      }
    }

    return diff;
  }

  /**
   * Get schema for specific section
   */
  private getSectionSchema(sectionPath: string): Joi.Schema | undefined {
    const sectionSchemas: Record<string, Joi.Schema> = {
      'api': configSchema.extract('api'),
      'fhir': configSchema.extract('fhir'),
      'nphies': configSchema.extract('nphies'),
      'security': configSchema.extract('security'),
      'localization': configSchema.extract('localization'),
      'ai': configSchema.extract('ai'),
      'ui': configSchema.extract('ui'),
      'logging': configSchema.extract('logging')
    };

    return sectionSchemas[sectionPath];
  }

  private createDefaultConfig(): SDKConfig {
    return {
      environment: 'development',
      api: {
        baseUrl: 'https://api.brainsait.com',
        timeout: 30000,
        retries: 3,
      },
      fhir: {
        serverUrl: 'https://fhir.nphies.sa',
        version: 'R4',
      },
      nphies: {
        baseUrl: 'https://nphies.sa',
        clientId: '',
        scope: ['read', 'write'],
        sandbox: true,
      },
      security: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keySize: 256,
        },
        audit: {
          enabled: true,
        },
        hipaa: {
          enabled: true,
          auditLevel: 'standard',
        },
      },
      localization: {
        defaultLanguage: 'ar',
        supportedLanguages: ['ar', 'en'],
        rtl: true,
      },
      ai: {
        enabled: false,
        providers: {},
      },
      ui: {
        theme: 'light',
        glassMorphism: {
          enabled: true,
          opacity: 0.1,
          blur: 20,
        },
        performance: {
          targetFps: 60,
          lazyLoading: true,
          virtualScrolling: true,
        },
      },
      logging: {
        level: 'info',
        format: 'json',
        outputs: ['console'],
      },
    };
  }
}