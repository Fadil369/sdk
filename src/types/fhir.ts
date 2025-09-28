/**
 * FHIR-related type definitions
 */

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type:
    | 'document'
    | 'message'
    | 'transaction'
    | 'transaction-response'
    | 'batch'
    | 'batch-response'
    | 'history'
    | 'searchset'
    | 'collection';
  entry?: FHIRBundleEntry[];
  total?: number;
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource?: FHIRResource;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: FHIRAddress[];
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
}

export interface FHIRSearchParameters {
  _id?: string;
  _lastUpdated?: string;
  _profile?: string;
  _security?: string;
  _source?: string;
  _tag?: string;
  _count?: number;
  _offset?: number;
  _sort?: string;
  _include?: string[];
  _revinclude?: string[];
  [key: string]: unknown;
}

// FHIR Extensions
export interface FHIRExtension {
  url: string;
  valueString?: string;
  valueCode?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueUri?: string;
  extension?: FHIRExtension[];
}

// FHIR Meta with extensions
export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  profile?: string[];
  extension?: FHIRExtension[];
}

// FHIR R4 Operation Outcomes
export interface FHIROperationOutcome extends FHIRResource {
  resourceType: 'OperationOutcome';
  issue: FHIROperationOutcomeIssue[];
}

export interface FHIROperationOutcomeIssue {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  details?: FHIRCodeableConcept;
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}

// FHIR Bundle for transactions and batch operations
export interface FHIRBundleRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface FHIRBundleResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIROperationOutcome;
}

// Extended FHIRBundleEntry with request/response
export interface FHIRBundleEntryComplete extends FHIRBundleEntry {
  request?: FHIRBundleRequest;
  response?: FHIRBundleResponse;
}

// Saudi Arabia specific extensions
export interface SaudiPatientExtension {
  saudiNationalId?: string;
  familyCardNumber?: string;
  sponsorId?: string;
  residencyType?: 'citizen' | 'resident' | 'visitor';
  region?: string;
}

// FHIR Client Configuration
export interface FHIRClientConfig {
  serverUrl: string;
  version: 'R4' | 'R5';
  authentication?: {
    type: 'oauth2' | 'basic' | 'bearer';
    credentials: Record<string, string>;
  };
  timeout?: number;
  retries?: number;
}

// FHIR Client Response
export interface FHIRResponse<T = FHIRResource> {
  data: T;
  status: number;
  headers: Record<string, string>;
  resourceId?: string;
  versionId?: string;
}

// FHIR Search Response
export interface FHIRSearchResponse<T = FHIRResource> {
  data: FHIRBundle;
  total?: number;
  resources: T[];
  links: {
    self?: string;
    next?: string;
    previous?: string;
    first?: string;
    last?: string;
  };
}

// FHIR Error
export interface FHIRError extends Error {
  status: number;
  operationOutcome?: FHIROperationOutcome;
  resource?: string;
  operation?: string;
}
