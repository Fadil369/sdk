/**
 * Enhanced Security manager with HIPAA compliance
 */
import { createHIPAAAuditLogger } from './compliance/audit';
import { createEncryptionService } from './compliance/encryption';
import { createPHIDataMasker, defaultMaskingConfig } from './compliance/masking';
import { createSessionManager, defaultSessionConfig } from './compliance/session';
import { createComplianceValidator } from './compliance/validation';
import { createRBACManager } from './auth/rbac';
export class SecurityManager {
    config;
    logger;
    auditLogger;
    encryptionService;
    phiMasker;
    sessionManager;
    complianceValidator;
    rbacManager;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async initialize() {
        const securityConfig = this.config.get('security');
        // Initialize audit logger
        this.auditLogger = createHIPAAAuditLogger({
            hipaaLevel: securityConfig.hipaa.auditLevel,
            retentionPeriod: 2555, // 7 years as required by HIPAA
            automaticReporting: true,
            endpoint: securityConfig.audit.endpoint,
        }, this.logger);
        // Initialize encryption service
        this.encryptionService = createEncryptionService({
            aes: {
                keySize: 256,
                algorithm: 'AES-256-GCM',
            },
            rsa: {
                keySize: 2048,
                algorithm: 'RSA-OAEP',
            },
            keyRotationInterval: 90, // 90 days
        }, this.logger);
        await this.encryptionService.initialize();
        // Initialize PHI masker
        this.phiMasker = createPHIDataMasker(defaultMaskingConfig, this.logger);
        // Initialize session manager
        this.sessionManager = createSessionManager(defaultSessionConfig, this.logger);
        // Initialize compliance validator
        this.complianceValidator = createComplianceValidator(this.logger);
        // Initialize RBAC manager
        this.rbacManager = createRBACManager(this.logger);
        this.logger.info('Security manager initialized with full compliance suite');
    }
    async healthCheck() {
        try {
            // Check if all components are initialized
            const components = {
                auditLogger: !!this.auditLogger,
                encryptionService: !!this.encryptionService,
                phiMasker: !!this.phiMasker,
                sessionManager: !!this.sessionManager,
                complianceValidator: !!this.complianceValidator,
                rbacManager: !!this.rbacManager,
            };
            const allHealthy = Object.values(components).every(Boolean);
            return {
                status: allHealthy ? 'up' : 'degraded',
                encryption: this.encryptionService ? 'enabled' : 'disabled',
                audit: this.auditLogger ? 'enabled' : 'disabled',
                compliance: this.complianceValidator ? 'enabled' : 'disabled',
                rbac: this.rbacManager ? 'enabled' : 'disabled',
            };
        }
        catch (error) {
            this.logger.error('Security health check failed', error);
            return {
                status: 'down',
                encryption: 'unknown',
                audit: 'unknown',
                compliance: 'unknown',
                rbac: 'unknown',
            };
        }
    }
    async shutdown() {
        // Shutdown session manager first to terminate active sessions
        if (this.sessionManager) {
            await this.sessionManager.shutdown();
        }
        // Cleanup audit logs if needed
        if (this.auditLogger) {
            await this.auditLogger.cleanupOldLogs();
        }
        // Rotate encryption keys if needed
        if (this.encryptionService) {
            await this.encryptionService.rotateKeys();
        }
        this.logger.info('Security manager shutdown complete');
    }
    // Getter methods to access security components
    getAuditLogger() {
        return this.auditLogger;
    }
    getEncryptionService() {
        return this.encryptionService;
    }
    getPHIMasker() {
        return this.phiMasker;
    }
    getSessionManager() {
        return this.sessionManager;
    }
    getComplianceValidator() {
        return this.complianceValidator;
    }
    getRBACManager() {
        return this.rbacManager;
    }
}
// Re-export all compliance and auth modules
export * from './compliance';
export * from './auth';
