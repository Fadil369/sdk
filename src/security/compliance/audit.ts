/**
 * HIPAA-compliant audit logger
 */

import { Logger } from '@/core/logger';
import { AuditLog, HIPAACompliance } from '@/types/security';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLoggerConfig {
  hipaaLevel: 'minimal' | 'standard' | 'comprehensive';
  retentionPeriod: number; // days
  automaticReporting: boolean;
  endpoint?: string;
}

export class HIPAAAuditLogger {
  private logs: Map<string, AuditLog> = new Map();
  private config: AuditLoggerConfig;
  private logger: Logger;

  constructor(config: AuditLoggerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ component: 'HIPAAAuditLogger' });
  }

  /**
   * Log a HIPAA-compliant audit event
   */
  async logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Store the log
    this.logs.set(auditLog.id, auditLog);

    // Log based on HIPAA level
    await this.processAuditLevel(auditLog);

    // Send to remote endpoint if configured
    if (this.config.endpoint && this.config.automaticReporting) {
      await this.sendToEndpoint(auditLog);
    }

    this.logger.info('Audit event logged', {
      eventId: auditLog.id,
      eventType: auditLog.eventType,
      userId: auditLog.userId,
      patientId: auditLog.patientId ? '***MASKED***' : undefined,
    });

    return auditLog.id;
  }

  /**
   * Process audit based on HIPAA compliance level
   */
  private async processAuditLevel(auditLog: AuditLog): Promise<void> {
    switch (this.config.hipaaLevel) {
      case 'minimal':
        // Log only basic information
        this.logger.info('HIPAA Audit - Minimal', {
          id: auditLog.id,
          eventType: auditLog.eventType,
          outcome: auditLog.outcome,
        });
        break;

      case 'standard':
        // Log standard HIPAA required fields
        this.logger.info('HIPAA Audit - Standard', {
          id: auditLog.id,
          eventType: auditLog.eventType,
          userId: auditLog.userId,
          action: auditLog.action,
          outcome: auditLog.outcome,
          timestamp: auditLog.timestamp,
        });
        break;

      case 'comprehensive':
        // Log all available information (with PHI masking)
        this.logger.info('HIPAA Audit - Comprehensive', {
          ...auditLog,
          patientId: auditLog.patientId ? this.maskPHI(auditLog.patientId) : undefined,
          details: auditLog.details ? this.maskPHIInDetails(auditLog.details) : undefined,
        });
        break;
    }
  }

  /**
   * Mask PHI data for logging
   */
  private maskPHI(value: string): string {
    if (value.length <= 4) return '***';
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }

  /**
   * Mask PHI in complex details object
   */
  private maskPHIInDetails(details: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...details };
    const phiFields = ['patientId', 'ssn', 'nationalId', 'phone', 'email', 'address'];
    
    for (const field of phiFields) {
      if (masked[field] && typeof masked[field] === 'string') {
        masked[field] = this.maskPHI(masked[field] as string);
      }
    }
    
    return masked;
  }

  /**
   * Send audit log to remote endpoint
   */
  private async sendToEndpoint(auditLog: AuditLog): Promise<void> {
    try {
      if (!this.config.endpoint) return;

      // This would typically use the API client
      // For now, we'll simulate the API call
      this.logger.debug('Sending audit log to endpoint', {
        endpoint: this.config.endpoint,
        logId: auditLog.id,
      });

      // Simulate async API call
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      this.logger.error('Failed to send audit log to endpoint', error as Error, {
        logId: auditLog.id,
      });
    }
  }

  /**
   * Retrieve audit logs with filters
   */
  async getAuditLogs(filters?: {
    userId?: string;
    eventType?: AuditLog['eventType'];
    startDate?: string;
    endDate?: string;
    outcome?: AuditLog['outcome'];
  }): Promise<AuditLog[]> {
    let logs = Array.from(this.logs.values());

    if (filters) {
      logs = logs.filter(log => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.eventType && log.eventType !== filters.eventType) return false;
        if (filters.outcome && log.outcome !== filters.outcome) return false;
        if (filters.startDate && log.timestamp < filters.startDate) return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        return true;
      });
    }

    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs(): Promise<number> {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.retentionPeriod);
    const cutoffDate = retentionDate.toISOString();

    let removedCount = 0;
    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoffDate) {
        this.logs.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.info('Cleaned up old audit logs', { removedCount, cutoffDate });
    }

    return removedCount;
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<{
    totalLogs: number;
    logsByEventType: Record<string, number>;
    logsByOutcome: Record<string, number>;
    oldestLog?: string;
    newestLog?: string;
  }> {
    const logs = Array.from(this.logs.values());
    const stats = {
      totalLogs: logs.length,
      logsByEventType: {} as Record<string, number>,
      logsByOutcome: {} as Record<string, number>,
      oldestLog: undefined as string | undefined,
      newestLog: undefined as string | undefined,
    };

    if (logs.length === 0) return stats;

    // Count by event type and outcome
    for (const log of logs) {
      stats.logsByEventType[log.eventType] = (stats.logsByEventType[log.eventType] || 0) + 1;
      stats.logsByOutcome[log.outcome] = (stats.logsByOutcome[log.outcome] || 0) + 1;
    }

    // Find oldest and newest
    const sortedLogs = logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (sortedLogs.length > 0) {
      stats.oldestLog = sortedLogs[0]!.timestamp;
      stats.newestLog = sortedLogs[sortedLogs.length - 1]!.timestamp;
    }

    return stats;
  }
}

/**
 * Factory function to create HIPAA audit logger
 */
export function createHIPAAAuditLogger(
  config: AuditLoggerConfig,
  logger: Logger
): HIPAAAuditLogger {
  return new HIPAAAuditLogger(config, logger);
}