/**
 * Core type definitions for the BrainSAIT Healthcare SDK
 */

export * from './config';
export * from './fhir';
export * from './common';
export * from './security';
export * from './ai';
export type { UIConfig, ComponentProps, GlassMorphismProps } from './ui';
// Re-export NPHIES types individually to avoid conflicts
export type {
  NPHIESConfig,
  NPHIESAuthToken,
  NPHIESSubmissionRequest,
  NPHIESSubmissionResponse,
  NPHIESError,
  NPHIESWarning,
  NPHIESClaim,
  NPHIESClaimItem,
  NPHIESCoverageEligibilityRequest,
  NPHIESEligibilityItem,
} from './nphies';
