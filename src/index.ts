/**
 * BrainSAIT Healthcare SDK
 *
 * A comprehensive SDK for NPHIES/FHIR integration with Arabic/HIPAA support,
 * AI agents, and glass morphism UI components for Saudi healthcare systems.
 *
 * @author BrainSAIT
 * @version 1.0.0
 */

export * from './core';
export * from './types';
export * from './utils';
export * from './fhir';
export * from './nphies';
export * from './security';
export * from './ai';
export * from './ui';
export * from './python';

// Main SDK class
export { BrainSAITHealthcareSDK } from './core/sdk';

// Default export for convenience
import { BrainSAITHealthcareSDK } from './core/sdk';
export default BrainSAITHealthcareSDK;
