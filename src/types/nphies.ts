/**
 * NPHIES-specific type definitions for Saudi Arabia
 */

export interface NPHIESConfig {
  baseUrl: string;
  clientId: string;
  clientSecret?: string;
  scope: string[];
  sandbox: boolean;
}

export interface NPHIESAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  issued_at: number;
}

// Define specific types for NPHIES data structures
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  [key: string]: unknown;
}

export interface NPHIESSubmissionRequest {
  submissionId: string;
  resourceType:
    | 'Claim'
    | 'ClaimResponse'
    | 'CoverageEligibilityRequest'
    | 'CoverageEligibilityResponse';
  data: FHIRResource;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
}

export interface NPHIESSubmissionResponse {
  submissionId: string;
  status: 'accepted' | 'rejected' | 'pending';
  outcomeCode?: string;
  outcomeDescription?: string;
  responseData?: FHIRResource;
  errors?: NPHIESError[];
  warnings?: NPHIESWarning[];
}

export interface NPHIESError {
  code: string;
  severity: 'error' | 'warning' | 'information';
  diagnostics: string;
  location?: string[];
}

export interface NPHIESWarning {
  code: string;
  severity: 'warning' | 'information';
  diagnostics: string;
  location?: string[];
}

export interface NPHIESClaim {
  resourceType: 'Claim';
  id?: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/claim-type';
        code: 'institutional' | 'oral' | 'pharmacy' | 'professional' | 'vision';
      },
    ];
  };
  patient: {
    reference: string;
  };
  created: string;
  provider: {
    reference: string;
  };
  priority: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/processpriority';
        code: 'normal' | 'stat';
      },
    ];
  };
  item?: NPHIESClaimItem[];
  total?: {
    value: number;
    currency: 'SAR';
  };
}

export interface NPHIESClaimItem {
  sequence: number;
  productOrService: {
    coding: [
      {
        system: string;
        code: string;
        display?: string;
      },
    ];
  };
  quantity?: {
    value: number;
  };
  unitPrice?: {
    value: number;
    currency: 'SAR';
  };
  net?: {
    value: number;
    currency: 'SAR';
  };
}

export interface NPHIESCoverageEligibilityRequest {
  resourceType: 'CoverageEligibilityRequest';
  id?: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  priority?: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/processpriority';
        code: 'normal' | 'stat';
      },
    ];
  };
  purpose: ('auth-requirements' | 'benefits' | 'discovery' | 'validation')[];
  patient: {
    reference: string;
  };
  created: string;
  provider: {
    reference: string;
  };
  insurer: {
    reference: string;
  };
  item?: NPHIESEligibilityItem[];
}

export interface NPHIESEligibilityItem {
  sequence: number;
  productOrService: {
    coding: [
      {
        system: string;
        code: string;
        display?: string;
      },
    ];
  };
  quantity?: {
    value: number;
  };
}
