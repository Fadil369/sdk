/**
 * HIPAA-compliant audit logger
 */
import { v4 as uuidv4 } from 'uuid';
export class HIPAAAuditLogger {
    logs = new Map();
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger.child({ component: 'HIPAAAuditLogger' });
    }
    /**
     * Log a HIPAA-compliant audit event
     */
    async logEvent(event) {
        const auditLog = {
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
    async processAuditLevel(auditLog) {
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
    maskPHI(value) {
        if (value.length <= 4)
            return '***';
        return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
    /**
     * Mask PHI in complex details object
     */
    maskPHIInDetails(details) {
        const masked = { ...details };
        const phiFields = ['patientId', 'ssn', 'nationalId', 'phone', 'email', 'address'];
        for (const field of phiFields) {
            if (masked[field] && typeof masked[field] === 'string') {
                masked[field] = this.maskPHI(masked[field]);
            }
        }
        return masked;
    }
    /**
     * Send audit log to remote endpoint
     */
    async sendToEndpoint(auditLog) {
        try {
            if (!this.config.endpoint)
                return;
            // This would typically use the API client
            // For now, we'll simulate the API call
            this.logger.debug('Sending audit log to endpoint', {
                endpoint: this.config.endpoint,
                logId: auditLog.id,
            });
            // Simulate async API call
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        catch (error) {
            this.logger.error('Failed to send audit log to endpoint', error, {
                logId: auditLog.id,
            });
        }
    }
    /**
     * Retrieve audit logs with filters
     */
    async getAuditLogs(filters) {
        let logs = Array.from(this.logs.values());
        if (filters) {
            logs = logs.filter(log => {
                if (filters.userId && log.userId !== filters.userId)
                    return false;
                if (filters.eventType && log.eventType !== filters.eventType)
                    return false;
                if (filters.outcome && log.outcome !== filters.outcome)
                    return false;
                if (filters.startDate && log.timestamp < filters.startDate)
                    return false;
                if (filters.endDate && log.timestamp > filters.endDate)
                    return false;
                return true;
            });
        }
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    /**
     * Clean up old audit logs based on retention policy
     */
    async cleanupOldLogs() {
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
    async getAuditStats() {
        const logs = Array.from(this.logs.values());
        const stats = {
            totalLogs: logs.length,
            logsByEventType: {},
            logsByOutcome: {},
            oldestLog: undefined,
            newestLog: undefined,
        };
        if (logs.length === 0)
            return stats;
        // Count by event type and outcome
        for (const log of logs) {
            stats.logsByEventType[log.eventType] = (stats.logsByEventType[log.eventType] || 0) + 1;
            stats.logsByOutcome[log.outcome] = (stats.logsByOutcome[log.outcome] || 0) + 1;
        }
        // Find oldest and newest
        const sortedLogs = logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        if (sortedLogs.length > 0) {
            stats.oldestLog = sortedLogs[0].timestamp;
            stats.newestLog = sortedLogs[sortedLogs.length - 1].timestamp;
        }
        return stats;
    }
}
/**
 * Factory function to create HIPAA audit logger
 */
export function createHIPAAAuditLogger(config, logger) {
    return new HIPAAAuditLogger(config, logger);
}
