/**
 * Configuration management for the SDK
 */

import { SDKConfig, SDKInitOptions } from '@/types/config';
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
    outputs: Joi.array()
      .items(Joi.string().valid('console', 'file', 'remote'))
      .default(['console']),
  }).required(),
});

export class ConfigManager {
  private config: SDKConfig;
  private validator: ((config: SDKConfig) => boolean) | undefined;

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
  get<T = unknown>(path: string): T {
    const keys = path.split('.');
    let value: unknown = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        throw new Error(`Configuration key '${path}' not found`);
      }
    }

    return value as T;
  }

  /**
   * Update configuration
   */
  update(newConfig: Partial<SDKConfig>): void {
    this.config = this.mergeConfig(
      this.config as unknown as Record<string, unknown>,
      newConfig as Record<string, unknown>
    );
  }

  /**
   * Validate configuration
   */
  validate(): void {
    try {
      const result = configSchema.validate(this.config, {
        abortEarly: false,
        allowUnknown: false,
      });

      if (result.error) {
        throw new Error(`Configuration validation failed: ${result.error.message}`);
      }

      this.config = result.value as SDKConfig;

      // Custom validation if provided
      if (this.validator && !this.validator(this.config)) {
        throw new Error('Custom configuration validation failed');
      }
    } catch (error) {
      throw new Error(
        `Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get full configuration
   */
  getAll(): SDKConfig {
    return { ...this.config };
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
        providers: {
          nlp: {
            endpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
          },
          analytics: {
            endpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
          },
        },
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

  private mergeConfig(base: Record<string, unknown>, override: Record<string, unknown>): SDKConfig {
    const result = { ...base } as Record<string, unknown>;

    for (const key in override) {
      if (override[key] !== undefined) {
        const overrideValue = override[key];
        const baseValue = result[key];

        if (
          typeof overrideValue === 'object' &&
          !Array.isArray(overrideValue) &&
          overrideValue !== null &&
          typeof baseValue === 'object' &&
          !Array.isArray(baseValue) &&
          baseValue !== null
        ) {
          result[key] = this.mergeConfig(
            baseValue as Record<string, unknown>,
            overrideValue as Record<string, unknown>
          );
        } else {
          result[key] = overrideValue;
        }
      }
    }

    return result as unknown as SDKConfig;
  }
}
