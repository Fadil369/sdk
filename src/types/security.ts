/**
 * Security and compliance type definitions
 */

export interface SecurityConfig {
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
}

export interface EncryptionKey {
  id: string;
  algorithm: string;
  key: string;
  createdAt: string;
  expiresAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: 'access' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';
  userId?: string;
  patientId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  outcome: 'success' | 'failure' | 'warning';
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  details?: Record<string, any>;
}

export interface HIPAACompliance {
  dataClassification: 'phi' | 'non-phi' | 'de-identified';
  accessControls: {
    role: string;
    permissions: string[];
  }[];
  auditRequirements: {
    logLevel: 'minimal' | 'standard' | 'comprehensive';
    retentionPeriod: number; // days
    automaticReporting: boolean;
  };
  encryptionRequirements: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
  };
}

export interface AccessToken {
  token: string;
  type: 'bearer' | 'basic';
  expiresAt: number;
  scope: string[];
  userId?: string;
  clientId?: string;
}

export interface SecurityPolicy {
  passwordRequirements: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionManagement: {
    maxDuration: number; // minutes
    idleTimeout: number; // minutes
    maxConcurrentSessions: number;
  };
  auditLogging: {
    enabled: boolean;
    level: 'minimal' | 'standard' | 'comprehensive';
    retention: number; // days
  };
}

export interface RoleBasedAccess {
  role: string;
  permissions: Permission[];
  restrictions?: Restriction[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'search')[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface Restriction {
  type: 'time' | 'location' | 'network' | 'device';
  rules: RestrictionRule[];
}

export interface RestrictionRule {
  condition: string;
  value: any;
  effect: 'allow' | 'deny';
}
