/**
 * Configuration types for the SDK
 */

export interface SDKConfig {
  /** Environment configuration */
  environment: 'development' | 'staging' | 'production';

  /** API configuration */
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    rateLimit?: {
      requests: number;
      window: number; // in seconds
    };
  };

  /** FHIR server configuration */
  fhir: {
    serverUrl: string;
    version: 'R4' | 'R5';
    authentication?: {
      type: 'oauth2' | 'basic' | 'bearer';
      credentials: Record<string, string>;
    };
  };

  /** NPHIES specific configuration */
  nphies: {
    baseUrl: string;
    clientId: string;
    clientSecret?: string;
    scope: string[];
    sandbox: boolean;
  };

  /** Security configuration */
  security: {
    encryption: {
      algorithm: string;
      keySize: number;
    };
    audit: {
      enabled: boolean;
      endpoint?: string;
    };
    hipaa: {
      enabled: boolean;
      auditLevel: 'minimal' | 'standard' | 'comprehensive';
    };
  };

  /** Localization configuration */
  localization: {
    defaultLanguage: 'ar' | 'en';
    supportedLanguages: string[];
    rtl: boolean;
  };

  /** AI configuration */
  ai?: {
    enabled: boolean;
    providers: {
      nlp?: {
        endpoint: string;
        model: string;
      };
      analytics?: {
        endpoint: string;
        model: string;
      };
    };
  };

  /** Analytics configuration */
  analytics?: {
    enabled: boolean;
  };
  caching?: {
    enabled: boolean;
    defaultTTL: number;
  };

  /** UI configuration */
  ui: {
    theme: 'light' | 'dark' | 'auto';
    glassMorphism: {
      enabled: boolean;
      opacity: number;
      blur: number;
    };
    performance: {
      targetFps: number;
      lazyLoading: boolean;
      virtualScrolling: boolean;
    };
  };

  /** Logging configuration */
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    outputs: ('console' | 'file' | 'remote')[];
  };
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  uiFrameRate: number;
  memoryUsage: number;
  concurrentUsers: number;
}

export interface SDKInitOptions extends Partial<SDKConfig> {
  /** Custom configuration validator */
  validator?: (config: SDKConfig) => boolean;

  /** Performance monitoring callback */
  onPerformanceMetric?: (metric: PerformanceMetrics) => void;

  /** Error handler */
  onError?: (error: Error) => void;
}
