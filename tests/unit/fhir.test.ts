/**
 * Unit tests for FHIR functionality - Phase 3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager } from '../../src/core/config';
import { Logger } from '../../src/core/logger';
import { ApiClient } from '../../src/core/client';
import { FHIRClient } from '../../src/fhir/client';
import { fhirValidator } from '../../src/fhir/validation';
import { FHIRBundleBuilder, FHIRBundleProcessor, createTransactionBundle } from '../../src/fhir/bundle';
import { createSaudiPatient, SaudiExtensionHelper } from '../../src/fhir/saudi-extensions';
import { FHIRPatient, FHIRBundle } from '../../src/types/fhir';

describe('FHIR Client', () => {
  let config: ConfigManager;
  let logger: Logger;
  let apiClient: ApiClient;
  let fhirClient: FHIRClient;

  beforeEach(() => {
    config = new ConfigManager({
      api: {
        baseUrl: 'https://test-api.brainsait.com',
        timeout: 5000,
        retries: 1,
      },
      fhir: {
        serverUrl: 'https://test-fhir.nphies.sa',
        version: 'R4',
      },
    });
    logger = new Logger(config.get('logging'));
    apiClient = new ApiClient(config, logger);
    fhirClient = new FHIRClient(config, logger, apiClient);
  });

  it('should initialize FHIR client', async () => {
    // Mock the API client to simulate capability statement
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: {
        resourceType: 'CapabilityStatement',
        status: 'active',
        fhirVersion: '4.0.1',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    await expect(fhirClient.initialize()).resolves.not.toThrow();
  });

  it('should perform health check', async () => {
    // Mock the API client
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: { resourceType: 'CapabilityStatement' },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    const health = await fhirClient.healthCheck();
    expect(health.status).toBe('up');
    expect(health.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should create a FHIR resource', async () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      name: [{ family: 'Test', given: ['Patient'] }],
    };

    // Mock successful create response
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: { ...patient, id: '123' },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    const response = await fhirClient.create(patient);
    expect(response.data.id).toBe('123');
    expect(response.status).toBe(200);
  });

  it('should read a FHIR resource', async () => {
    const mockPatient: FHIRPatient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ family: 'Test', given: ['Patient'] }],
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: mockPatient,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    const response = await fhirClient.read<FHIRPatient>('Patient', '123');
    expect(response.data.id).toBe('123');
    expect(response.data.resourceType).toBe('Patient');
  });

  it('should search for FHIR resources', async () => {
    const mockBundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{
        resource: {
          resourceType: 'Patient',
          id: '123',
          name: [{ family: 'Test', given: ['Patient'] }],
        },
      }],
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: mockBundle,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    const response = await fhirClient.search('Patient', { name: 'Test' });
    expect(response.resources).toHaveLength(1);
    expect(response.total).toBe(1);
  });

  it('should process transaction bundle', async () => {
    const transactionBundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [{
        resource: { resourceType: 'Patient', name: [{ family: 'Test' }] },
        request: { method: 'POST', url: 'Patient' },
      }],
    };

    const responseBundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [{
        resource: { resourceType: 'Patient', id: '123', name: [{ family: 'Test' }] },
        response: { status: '201 Created', location: 'Patient/123' },
      }],
    };

    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: responseBundle,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: 'test-123',
        responseTime: 100,
      },
    });

    const response = await fhirClient.transaction(transactionBundle);
    expect(response.data.type).toBe('transaction-response');
  });
});

describe('FHIR Validation', () => {
  it('should validate basic FHIR resource', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      name: [{ family: 'Test', given: ['Patient'] }],
    };

    const result = fhirValidator.validateResource(patient);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect invalid resource', () => {
    const invalidPatient = {
      // Missing resourceType
      name: [{ family: 'Test' }],
    } as FHIRPatient;

    const result = fhirValidator.validateResource(invalidPatient);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(issue => issue.code === 'required')).toBe(true);
  });

  it('should validate Saudi National ID', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      identifier: [{
        system: 'https://fhir.nphies.sa/CodeSystem/identifier',
        value: '1234567890', // Invalid format
      }],
    };

    const result = fhirValidator.validateResource(patient);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(issue => 
      issue.message.includes('Invalid Saudi National ID')
    )).toBe(true);
  });

  it('should validate Saudi phone number format', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      telecom: [{
        system: 'phone',
        value: '123456789', // Invalid Saudi phone format
      }],
    };

    const result = fhirValidator.validateResource(patient);
    expect(result.issues.some(issue => 
      issue.message.includes('Phone number does not match Saudi Arabia format')
    )).toBe(true);
  });
});

describe('FHIR Bundle Operations', () => {
  it('should create transaction bundle', () => {
    const builder = createTransactionBundle();
    
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      name: [{ family: 'Test', given: ['Patient'] }],
    };

    builder.addCreate(patient);
    const bundle = builder.build();

    expect(bundle.type).toBe('transaction');
    expect(bundle.entry).toHaveLength(1);
    expect(bundle.entry?.[0]?.request?.method).toBe('POST');
  });

  it('should create batch bundle with multiple operations', () => {
    const builder = new FHIRBundleBuilder('batch');
    
    const patient1: FHIRPatient = {
      resourceType: 'Patient',
      name: [{ family: 'Test1' }],
    };
    
    const patient2: FHIRPatient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ family: 'Test2' }],
    };

    builder.addCreate(patient1);
    builder.addUpdate(patient2);
    builder.addDelete('Patient', '456');

    const bundle = builder.build();

    expect(bundle.type).toBe('batch');
    expect(bundle.entry).toHaveLength(3);
    expect(bundle.entry?.[0]?.request?.method).toBe('POST');
    expect(bundle.entry?.[1]?.request?.method).toBe('PUT');
    expect(bundle.entry?.[2]?.request?.method).toBe('DELETE');
  });

  it('should validate bundle structure', () => {
    const invalidBundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [{
        resource: { resourceType: 'Patient', name: [{ family: 'Test' }] },
        // Missing request for transaction bundle
      }],
    };

    const result = FHIRBundleProcessor.validateBundle(invalidBundle);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Saudi Arabia FHIR Extensions', () => {
  // Using test Saudi ID format for testing
  const TEST_SAUDI_ID = '1020304050'; 

  it('should create Saudi patient with National ID', () => {
    const builder = createSaudiPatient();
    
    const patient = builder
      .setSaudiNationalId(TEST_SAUDI_ID, true) // Skip validation for test
      .setArabicName('الاختبار', ['مريض'])
      .setEnglishName('Test', ['Patient'])
      .setBasicInfo('male', '1990-01-01')
      .setResidencyType('citizen')
      .setRegion('riyadh')
      .build();

    expect(patient.resourceType).toBe('Patient');
    expect(patient.identifier).toHaveLength(1);
    expect(patient.name).toHaveLength(2);
    expect(patient.extension).toBeDefined();
  });

  it('should extract Saudi National ID from patient', () => {
    const patient = createSaudiPatient()
      .setSaudiNationalId(TEST_SAUDI_ID, true)
      .build();

    const nationalId = SaudiExtensionHelper.getSaudiNationalId(patient);
    expect(nationalId).toBe(TEST_SAUDI_ID);
  });

  it('should normalize Saudi phone numbers', () => {
    const builder = createSaudiPatient();
    
    const patient = builder
      .setSaudiNationalId(TEST_SAUDI_ID, true)
      .setSaudiPhoneNumber('0512345678')
      .build();

    expect(patient.telecom?.[0]?.value).toBe('+966512345678');
  });

  it('should detect Saudi citizen', () => {
    const patient = createSaudiPatient()
      .setSaudiNationalId(TEST_SAUDI_ID, true)
      .setResidencyType('citizen')
      .build();

    const isCitizen = SaudiExtensionHelper.isSaudiCitizen(patient);
    expect(isCitizen).toBe(true);
  });

  it('should handle Arabic and English names', () => {
    const patient = createSaudiPatient()
      .setSaudiNationalId(TEST_SAUDI_ID, true)
      .setArabicName('الاختبار', ['مريض'])
      .setEnglishName('Test', ['Patient'])
      .build();

    const arabicName = SaudiExtensionHelper.getArabicName(patient);
    const englishName = SaudiExtensionHelper.getEnglishName(patient);

    expect(arabicName?.family).toBe('الاختبار');
    expect(englishName?.family).toBe('Test');
  });

  it('should require National ID for Saudi patients', () => {
    const builder = createSaudiPatient();
    
    expect(() => {
      builder.build(); // Should throw without National ID
    }).toThrow('Saudi patient must have at least one identifier');
  });
});