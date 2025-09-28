/**
 * FHIR-related type definitions
 */

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
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
  [key: string]: any;
}
