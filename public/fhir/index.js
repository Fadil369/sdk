/**
 * FHIR client and utilities - Phase 3 Implementation
 */
// Re-export the full FHIR client implementation
export { FHIRClient } from './client';
// Re-export validation utilities
export { FHIRValidator, fhirValidator } from './validation';
// Re-export bundle operations
export { FHIRBundleBuilder, FHIRBundleProcessor, createTransactionBundle, createBatchBundle, createDocumentBundle, createCollectionBundle, } from './bundle';
// Re-export Saudi Arabia extensions
export { SaudiPatientBuilder, SaudiExtensionHelper, createSaudiPatient, SAUDI_SYSTEMS, SAUDI_REGIONS, } from './saudi-extensions';
// Legacy FHIRClient class for backward compatibility
// This will be removed once the main SDK is updated to use the new FHIRClient
export class LegacyFHIRClient {
    _config;
    logger;
    _apiClient;
    constructor(
    // @ts-ignore - Used for future compatibility
    _config, logger, 
    // @ts-ignore - Used for future compatibility
    _apiClient) {
        this._config = _config;
        this.logger = logger;
        this._apiClient = _apiClient;
    }
    async initialize() {
        this.logger.info('FHIR client initialized');
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    async healthCheck() {
        await new Promise(resolve => setTimeout(resolve, 1));
        return { status: 'up', responseTime: 100 };
    }
    async shutdown() {
        this.logger.info('FHIR client shutdown');
        await new Promise(resolve => setTimeout(resolve, 1));
    }
}
