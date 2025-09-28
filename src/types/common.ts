/**
 * Common types and interfaces used throughout the SDK
 */

export type Locale = 'ar' | 'en';
export type CommonTheme = 'light' | 'dark' | 'auto';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    responseTime: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface HealthcheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    [serviceName: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  stackTrace?: string;
}

export interface AuditEvent {
  eventType: string;
  userId?: string;
  patientId?: string;
  resource?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'search';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
}
