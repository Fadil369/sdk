/**
 * Unit tests for security and compliance features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager } from '../../src/core/config';
import { Logger } from '../../src/core/logger';
import { 
  HIPAAAuditLogger, 
  EncryptionService, 
  PHIDataMasker, 
  SessionManager, 
  ComplianceValidator,
  RBACManager,
  createValidationContext
} from '../../src/security';

describe('HIPAA Audit Logger', () => {
  let logger: Logger;
  let auditLogger: HIPAAAuditLogger;

  beforeEach(() => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    auditLogger = new HIPAAAuditLogger({
      hipaaLevel: 'standard',
      retentionPeriod: 30,
      automaticReporting: false,
    }, logger);
  });

  it('should log audit events', async () => {
    const eventId = await auditLogger.logEvent({
      eventType: 'access',
      userId: 'user123',
      patientId: 'patient456',
      action: 'read',
      outcome: 'success',
    });

    expect(eventId).toBeDefined();
    expect(typeof eventId).toBe('string');

    const logs = await auditLogger.getAuditLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].eventType).toBe('access');
  });

  it('should filter audit logs', async () => {
    await auditLogger.logEvent({
      eventType: 'create',
      userId: 'user123',
      action: 'create',
      outcome: 'success',
    });

    await auditLogger.logEvent({
      eventType: 'update',
      userId: 'user456',
      action: 'update',
      outcome: 'failure',
    });

    const successLogs = await auditLogger.getAuditLogs({ outcome: 'success' });
    expect(successLogs).toHaveLength(1);
    expect(successLogs[0].outcome).toBe('success');

    const user123Logs = await auditLogger.getAuditLogs({ userId: 'user123' });
    expect(user123Logs).toHaveLength(1);
    expect(user123Logs[0].userId).toBe('user123');
  });

  it('should get audit statistics', async () => {
    await auditLogger.logEvent({
      eventType: 'access',
      userId: 'user123',
      action: 'read',
      outcome: 'success',
    });

    const stats = await auditLogger.getAuditStats();
    expect(stats.totalLogs).toBe(1);
    expect(stats.logsByEventType.access).toBe(1);
    expect(stats.logsByOutcome.success).toBe(1);
  });
});

describe('Encryption Service', () => {
  let logger: Logger;
  let encryptionService: EncryptionService;

  beforeEach(async () => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    encryptionService = new EncryptionService({
      aes: { keySize: 256, algorithm: 'AES-256-GCM' },
      rsa: { keySize: 2048, algorithm: 'RSA-OAEP' },
    }, logger);
    await encryptionService.initialize();
  });

  it('should encrypt and decrypt with AES', async () => {
    const originalData = 'Sensitive patient information';
    
    const encrypted = await encryptionService.encryptWithAES(originalData);
    expect(encrypted.algorithm).toBe('AES-256-GCM');
    expect(encrypted.data).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();

    const decrypted = await encryptionService.decryptWithAES(encrypted);
    expect(decrypted).toBe(originalData);
  });

  it('should encrypt and decrypt PHI data', async () => {
    const phiData = 'Patient John Doe, SSN: 123-45-6789';
    
    const encrypted = await encryptionService.encryptPHI(phiData, {
      patientId: 'patient123',
      dataType: 'demographics',
    });

    const decrypted = await encryptionService.decryptPHI(encrypted, {
      patientId: 'patient123',
      dataType: 'demographics',
    });

    expect(decrypted).toBe(phiData);
  });

  it('should generate and manage encryption keys', async () => {
    const keyId = await encryptionService.generateAESKey('test-key');
    
    const keyInfo = encryptionService.getKeyInfo(keyId);
    expect(keyInfo).toBeDefined();
    expect(keyInfo?.id).toBe(keyId);
    expect(keyInfo?.algorithm).toBe('AES-256-GCM');

    const allKeys = encryptionService.listKeys();
    expect(allKeys.length).toBeGreaterThan(0);
  });
});

describe('PHI Data Masker', () => {
  let logger: Logger;
  let phiMasker: PHIDataMasker;

  beforeEach(() => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    phiMasker = new PHIDataMasker({
      defaultMaskChar: '*',
      preserveFormat: true,
      maskingPatterns: {
        ssn: true,
        phone: true,
        email: true,
        nationalId: true,
        medicalRecordNumber: true,
        accountNumber: true,
        certificateNumber: true,
        vehicleIdentifier: true,
        deviceIdentifier: true,
        webUrl: true,
        ipAddress: true,
        biometricIdentifier: true,
        facePhotograph: true,
        otherUniqueIdentifier: true,
      },
    }, logger);
  });

  it('should mask SSN correctly', () => {
    const ssn = '123-45-6789';
    const masked = phiMasker.maskValue(ssn, 'ssn');
    expect(masked).toBe('***-**-6789');
  });

  it('should mask email addresses', () => {
    const email = 'john.doe@example.com';
    const masked = phiMasker.maskValue(email, 'email');
    // Check that the email is masked and different from original
    expect(typeof masked).toBe('string');
    expect(masked).not.toBe(email);
    expect(masked.length).toBeGreaterThan(0);
  });

  it('should mask phone numbers', () => {
    const phone = '(555) 123-4567';
    const masked = phiMasker.maskValue(phone, 'phone');
    expect(masked).toBe('(***) ***-4567');
  });

  it('should mask complex objects', () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      address: '123 Main St',
      medicalHistory: [
        { condition: 'Diabetes', date: '2023-01-15' }
      ]
    };

    const masked = phiMasker.maskObject(patientData);
    
    // Check that sensitive fields are masked (exact format may vary)
    expect(masked.firstName).not.toBe('John');
    expect(masked.lastName).not.toBe('Doe');
    expect(masked.ssn).toBe('***-**-6789');
    expect(typeof masked.email).toBe('string');
    expect(masked.email).not.toBe('john.doe@example.com');
    expect(typeof masked.phone).toBe('string');
    expect(masked.phone).not.toBe('555-123-4567');
    expect(Array.isArray(masked.medicalHistory)).toBe(true);
  });

  it('should provide masking statistics', () => {
    const stats = phiMasker.getMaskingStats();
    expect(stats.totalRules).toBeGreaterThan(0);
    expect(stats.phiFields).toContain('ssn');
    expect(stats.phiFields).toContain('email');
    expect(stats.phiFields).toContain('phone');
  });
});

describe('Session Manager', () => {
  let logger: Logger;
  let sessionManager: SessionManager;

  beforeEach(() => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    sessionManager = new SessionManager({
      maxDuration: 480, // 8 hours
      idleTimeout: 30, // 30 minutes
      maxConcurrentSessions: 3,
      secureTransport: true,
      sessionTokenLength: 64,
      renewBeforeExpiry: 60,
    }, logger);
  });

  afterEach(async () => {
    await sessionManager.shutdown();
  });

  it('should create and validate sessions', async () => {
    const session = await sessionManager.createSession(
      'user123',
      'physician',
      ['Patient:read', 'Patient:write'],
      {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      }
    );

    expect(session.sessionId).toBeDefined();
    expect(session.userId).toBe('user123');
    expect(session.userRole).toBe('physician');
    expect(session.isActive).toBe(true);

    const validatedSession = await sessionManager.validateSession(
      session.sessionId,
      '192.168.1.100'
    );

    expect(validatedSession).toBeDefined();
    expect(validatedSession?.sessionId).toBe(session.sessionId);
  });

  it('should handle concurrent session limits', async () => {
    // Create 3 sessions (max limit)
    const sessions = [];
    for (let i = 0; i < 3; i++) {
      const session = await sessionManager.createSession(
        'user123',
        'physician',
        ['Patient:read'],
        { ipAddress: '192.168.1.100' }
      );
      sessions.push(session);
    }

    // Creating a 4th session should terminate the oldest
    const newSession = await sessionManager.createSession(
      'user123',
      'physician',
      ['Patient:read'],
      { ipAddress: '192.168.1.100' }
    );

    const userSessions = sessionManager.getUserSessions('user123');
    expect(userSessions).toHaveLength(3); // Still at max limit
    expect(userSessions.find(s => s.sessionId === newSession.sessionId)).toBeDefined();
  });

  it('should update session permissions', async () => {
    const session = await sessionManager.createSession(
      'user123',
      'nurse',
      ['Patient:read']
    );

    const updated = await sessionManager.updateSessionPermissions(
      session.sessionId,
      ['Patient:read', 'Patient:write', 'Medication:read']
    );

    expect(updated).toBe(true);

    const info = sessionManager.getSessionInfo(session.sessionId);
    expect(info?.permissions).toContain('Patient:write');
    expect(info?.permissions).toContain('Medication:read');
  });

  it('should provide session statistics', () => {
    const stats = sessionManager.getSessionStats();
    expect(stats).toHaveProperty('totalSessions');
    expect(stats).toHaveProperty('activeSessions');
    expect(stats).toHaveProperty('userCount');
    expect(stats).toHaveProperty('averageSessionDuration');
  });
});

describe('Compliance Validator', () => {
  let logger: Logger;
  let validator: ComplianceValidator;

  beforeEach(() => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    validator = new ComplianceValidator(logger);
  });

  it('should validate user identification', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
    });

    const report = await validator.validateCompliance(context);
    expect(report.overallCompliance).toBeGreaterThan(0);
    expect(report.passedRules).toBeGreaterThan(0);
  });

  it('should fail validation without user ID', async () => {
    const context = createValidationContext({
      operationType: 'read',
      resource: 'Patient',
    });

    const report = await validator.validateCompliance(context);
    expect(report.criticalFailures).toBeGreaterThan(0);
    expect(report.overallCompliance).toBeLessThan(100);
  });

  it('should validate access control', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      auditLogged: true,
    });

    const report = await validator.validateCompliance(context);
    
    // Should pass basic validation
    expect(report.overallCompliance).toBeGreaterThan(50);
    
    // Check specific rule results
    const userIdRule = report.ruleResults.find(r => r.ruleId === 'admin_001');
    expect(userIdRule?.passed).toBe(true);

    const accessControlRule = report.ruleResults.find(r => r.ruleId === 'tech_005');
    expect(accessControlRule?.passed).toBe(true);
  });

  it('should perform quick validation for critical rules', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      auditLogged: true,
    });

    const quickResult = await validator.quickValidation(context);
    expect(quickResult.passed).toBe(true);
    expect(quickResult.criticalFailures).toBe(0);
  });

  it('should provide compliance statistics', () => {
    const stats = validator.getComplianceStats();
    expect(stats.totalRules).toBeGreaterThan(0);
    expect(stats.rulesByCategory).toHaveProperty('administrative');
    expect(stats.rulesByCategory).toHaveProperty('technical');
    expect(stats.rulesBySeverity).toHaveProperty('critical');
  });

  it('should perform enhanced parallel validation', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      auditLogged: true,
    });

    const result = await validator.quickValidation(context);
    expect(result.passed).toBe(true);
    expect(result.criticalFailures).toBe(0);
    expect(result.performanceMetrics).toBeDefined();
    expect(result.performanceMetrics.executionTime).toBeGreaterThan(0);
    expect(result.performanceMetrics.rulesEvaluated).toBeGreaterThan(0);
  });

  it('should validate MFA requirements for critical operations', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:export'],
      operationType: 'export',
      resource: 'Patient',
      auditLogged: true,
      // Missing MFA verification
    });

    const report = await validator.validateCompliance(context);
    const mfaRule = report.ruleResults.find(r => r.ruleId === 'tech_006');
    expect(mfaRule?.passed).toBe(false);
    expect(mfaRule?.message).toContain('Multi-factor authentication required');
  });

  it('should validate IP address restrictions', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      sessionInfo: {
        id: 'session123',
        ipAddress: '203.0.113.1', // Public IP address
        userAgent: 'Test Browser',
      },
      auditLogged: true,
      // Missing IP whitelisting
    });

    const report = await validator.validateCompliance(context);
    const ipRule = report.ruleResults.find(r => r.ruleId === 'tech_007');
    expect(ipRule?.passed).toBe(false);
    expect(ipRule?.message).toContain('non-authorized IP address');
  });

  it('should perform advanced validation with risk scoring', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      auditLogged: true,
    });

    const result = await validator.advancedValidation(context);
    expect(result.riskScore).toBeDefined();
    expect(result.riskLevel).toMatch(/^(low|medium|high|critical)$/);
    expect(result.priorityRecommendations).toBeDefined();
    expect(result.performanceMetrics).toBeDefined();
  });

  it('should validate BAA requirements for third-party access', async () => {
    const context = createValidationContext({
      userId: 'thirdparty123',
      userRole: 'third-party',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      auditLogged: true,
      // Missing BAA verification
    });

    const report = await validator.validateCompliance(context);
    const baaRule = report.ruleResults.find(r => r.ruleId === 'admin_004');
    expect(baaRule?.passed).toBe(false);
    expect(baaRule?.message).toContain('Business Associate Agreement not verified');
  });

  it('should validate device security compliance', async () => {
    const context = createValidationContext({
      userId: 'user123',
      userRole: 'physician',
      permissions: ['Patient:read'],
      operationType: 'read',
      resource: 'Patient',
      sessionInfo: {
        id: 'session123',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/50.0', // Outdated browser
      },
      auditLogged: true,
    });

    const report = await validator.validateCompliance(context);
    const deviceRule = report.ruleResults.find(r => r.ruleId === 'phys_002');
    expect(deviceRule?.passed).toBe(false);
    expect(deviceRule?.message).toContain('Insecure or outdated browser');
  });
});

describe('RBAC Manager', () => {
  let logger: Logger;
  let rbacManager: RBACManager;

  beforeEach(() => {
    logger = new Logger({ level: 'info', format: 'json', outputs: ['console'] });
    rbacManager = new RBACManager(logger);
  });

  it('should initialize with default healthcare roles', () => {
    const roles = rbacManager.listRoles();
    expect(roles.length).toBeGreaterThan(0);

    const physicianRole = rbacManager.getRole('physician');
    expect(physicianRole).toBeDefined();
    expect(physicianRole?.name).toBe('Physician');
    expect(physicianRole?.permissions.length).toBeGreaterThan(0);
  });

  it('should create and manage users', async () => {
    const user = await rbacManager.setUser({
      id: 'user123',
      username: 'john.doe',
      roles: ['physician'],
      isActive: true,
    });

    expect(user.id).toBe('user123');
    expect(user.roles).toContain('physician');

    const retrievedUser = rbacManager.getUser('user123');
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.username).toBe('john.doe');
  });

  it('should check access permissions', async () => {
    await rbacManager.setUser({
      id: 'user123',
      username: 'john.doe',
      roles: ['physician'],
      isActive: true,
    });

    const context = {
      userId: 'user123',
      resource: 'Patient',
      action: 'read' as const,
    };

    const result = await rbacManager.checkAccess(context);
    expect(result.granted).toBe(true);
    expect(result.matchedPermissions.length).toBeGreaterThan(0);
  });

  it('should deny access for unauthorized actions', async () => {
    await rbacManager.setUser({
      id: 'user123',
      username: 'receptionist',
      roles: ['receptionist'],
      isActive: true,
    });

    const context = {
      userId: 'user123',
      resource: 'DiagnosticReport',
      action: 'create' as const,
    };

    const result = await rbacManager.checkAccess(context);
    expect(result.granted).toBe(false);
  });

  it('should provide user permissions summary', async () => {
    await rbacManager.setUser({
      id: 'user123',
      username: 'nurse.jane',
      roles: ['nurse'],
      isActive: true,
    });

    const permissions = rbacManager.getUserPermissions('user123');
    expect(permissions.roles).toContain('nurse');
    expect(permissions.permissions.length).toBeGreaterThan(0);
    expect(permissions.restrictions.length).toBeGreaterThan(0);
  });

  it('should provide RBAC statistics', () => {
    const stats = rbacManager.getRBACStats();
    expect(stats.totalRoles).toBeGreaterThan(0);
    expect(stats.activeRoles).toBeGreaterThan(0);
    expect(stats.totalPermissions).toBeGreaterThan(0);
  });
});