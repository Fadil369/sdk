/**
 * FHIR client and utilities - Phase 3 Implementation
 */

import { ConfigManager } from '@/core/config';
import { Logger } from '@/core/logger';
import { ApiClient } from '@/core/client';

// Re-export the full FHIR client implementation
export { FHIRClient } from './client';

// Re-export validation utilities
export { FHIRValidator, fhirValidator } from './validation';
export type { ValidationResult, ValidationIssue } from './validation';

// Re-export bundle operations
export {
  FHIRBundleBuilder,
  FHIRBundleProcessor,
  createTransactionBundle,
  createBatchBundle,
  createDocumentBundle,
  createCollectionBundle,
} from './bundle';

// Re-export Saudi Arabia extensions
export {
  SaudiPatientBuilder,
  SaudiExtensionHelper,
  createSaudiPatient,
  SAUDI_SYSTEMS,
  SAUDI_REGIONS,
} from './saudi-extensions';
export type { SaudiPatientProfile, SaudiRegion, ResidencyType } from './saudi-extensions';

// Legacy FHIRClient class for backward compatibility
// This will be removed once the main SDK is updated to use the new FHIRClient
export class LegacyFHIRClient {
  constructor(
    private _config: ConfigManager,
    private logger: Logger,
    private _apiClient: ApiClient
  ) {}

  async initialize(): Promise<void> {
    this.logger.info('FHIR client initialized');
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  async healthCheck(): Promise<{ status: string; responseTime: number }> {
    await new Promise(resolve => setTimeout(resolve, 1));
    return { status: 'up', responseTime: 100 };
  }

  async shutdown(): Promise<void> {
    this.logger.info('FHIR client shutdown');
    await new Promise(resolve => setTimeout(resolve, 1));
  }
}
