/**
 * Enhanced Security manager with HIPAA compliance
 */

import { ConfigManager } from '@/core/config';
import { Logger } from '@/core/logger';
import { HIPAAAuditLogger, createHIPAAAuditLogger } from './compliance/audit';
import { EncryptionService, createEncryptionService } from './compliance/encryption';
import { PHIDataMasker, createPHIDataMasker, defaultMaskingConfig } from './compliance/masking';
import { SessionManager, createSessionManager, defaultSessionConfig } from './compliance/session';
import { ComplianceValidator, createComplianceValidator } from './compliance/validation';
import { RBACManager, createRBACManager } from './auth/rbac';

export class SecurityManager {
  private auditLogger?: HIPAAAuditLogger;
  private encryptionService?: EncryptionService;
  private phiMasker?: PHIDataMasker;
  private sessionManager?: SessionManager;
  private complianceValidator?: ComplianceValidator;
  private rbacManager?: RBACManager;

  constructor(
    private config: ConfigManager,
    private logger: Logger
  ) {}

  async initialize(): Promise<void> {
    const securityConfig = this.config.get('security') as {
      hipaa?: { auditLevel?: 'minimal' | 'standard' | 'comprehensive' };
      audit?: { endpoint?: string };
      encryption?: { algorithm?: string; keySize?: number };
    };

    // Initialize audit logger
    const hipaaLevel = securityConfig?.hipaa?.auditLevel ?? 'standard';
    this.auditLogger = createHIPAAAuditLogger(
      {
        hipaaLevel,
        retentionPeriod: 2555, // 7 years as required by HIPAA
        automaticReporting: true,
        endpoint: securityConfig?.audit?.endpoint,
      },
      this.logger
    );

    // Initialize encryption service
    this.encryptionService = createEncryptionService(
      {
        aes: {
          keySize: 256,
          algorithm: 'AES-256-GCM',
        },
        rsa: {
          keySize: 2048,
          algorithm: 'RSA-OAEP',
        },
        keyRotationInterval: 90, // 90 days
      },
      this.logger
    );

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

  async healthCheck(): Promise<{
    status: string;
    encryption: string;
    audit: string;
    compliance: string;
    rbac: string;
  }> {
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
    } catch (error) {
      this.logger.error('Security health check failed', error as Error);
      return {
        status: 'down',
        encryption: 'unknown',
        audit: 'unknown',
        compliance: 'unknown',
        rbac: 'unknown',
      };
    }
  }

  async shutdown(): Promise<void> {
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
  getAuditLogger(): HIPAAAuditLogger | undefined {
    return this.auditLogger;
  }

  getEncryptionService(): EncryptionService | undefined {
    return this.encryptionService;
  }

  getPHIMasker(): PHIDataMasker | undefined {
    return this.phiMasker;
  }

  getSessionManager(): SessionManager | undefined {
    return this.sessionManager;
  }

  getComplianceValidator(): ComplianceValidator | undefined {
    return this.complianceValidator;
  }

  getRBACManager(): RBACManager | undefined {
    return this.rbacManager;
  }
}

// Re-export all compliance and auth modules
export * from './compliance';
export * from './auth';
