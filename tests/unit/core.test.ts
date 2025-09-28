/**
 * Unit tests for core SDK functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BrainSAITHealthcareSDK } from '../../src';
import { ConfigManager } from '../../src/core/config';

describe('BrainSAIT Healthcare SDK', () => {
  let sdk: BrainSAITHealthcareSDK;

  beforeEach(() => {
    sdk = new BrainSAITHealthcareSDK({
      api: {
        baseUrl: 'https://test-api.brainsait.com',
        timeout: 5000,
        retries: 1,
      },
      fhir: {
        serverUrl: 'https://test-fhir.nphies.sa',
        version: 'R4',
      },
      nphies: {
        baseUrl: 'https://test-nphies.sa',
        clientId: 'test-client',
        scope: ['read'],
        sandbox: true,
      },
    });
  });

  it('should create SDK instance', () => {
    expect(sdk).toBeInstanceOf(BrainSAITHealthcareSDK);
  });

  it('should initialize successfully', async () => {
    await expect(sdk.initialize()).resolves.not.toThrow();
  });

  it('should get performance metrics', () => {
    const metrics = sdk.getPerformanceMetrics();
    expect(metrics).toHaveProperty('apiResponseTime');
    expect(metrics).toHaveProperty('uiFrameRate');
    expect(metrics).toHaveProperty('memoryUsage');
    expect(metrics).toHaveProperty('concurrentUsers');
  });

  it('should perform health check', async () => {
    await sdk.initialize();
    const health = await sdk.healthCheck();
    
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('version');
    expect(health).toHaveProperty('services');
    expect(health.services).toHaveProperty('fhir');
    expect(health.services).toHaveProperty('nphies');
    expect(health.services).toHaveProperty('security');
  });
});

describe('ConfigManager', () => {
  it('should create with default config', () => {
    const config = new ConfigManager();
    expect(config.get('environment')).toBe('development');
    expect(config.get('localization.defaultLanguage')).toBe('ar');
  });

  it('should update configuration', () => {
    const config = new ConfigManager();
    config.update({ environment: 'production' });
    expect(config.get('environment')).toBe('production');
  });

  it('should validate configuration', async () => {
    const config = new ConfigManager({
      api: {
        baseUrl: 'https://api.example.com',
        timeout: 30000,
        retries: 3,
      },
      fhir: {
        serverUrl: 'https://fhir.example.com',
        version: 'R4',
      },
      nphies: {
        baseUrl: 'https://nphies.example.com',
        clientId: 'test-client',
        scope: ['read'],
        sandbox: true,
      },
    });

    expect(() => config.validate()).not.toThrow();
  });
});