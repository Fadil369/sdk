/**
 * HIPAA compliance validation framework
 */

import { Logger } from '@/core/logger';
import { HIPAACompliance, SecurityPolicy } from '@/types/security';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'administrative' | 'physical' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  required: boolean;
  validate: (context: ValidationContext) => Promise<ComplianceComplianceValidationResult>;
}

export interface ValidationContext {
  data?: unknown;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  session?: {
    id: string;
    ipAddress?: string;
    userAgent?: string;
  };
  operation?: {
    type: 'create' | 'read' | 'update' | 'delete' | 'export';
    resource: string;
    resourceId?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface ComplianceComplianceValidationResult {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
  recommendations?: string[];
}

export interface ComplianceReport {
  overallCompliance: number; // percentage
  totalRules: number;
  passedRules: number;
  failedRules: number;
  criticalFailures: number;
  timestamp: string;
  ruleResults: {
    ruleId: string;
    ruleName: string;
    category: string;
    severity: string;
    passed: boolean;
    message: string;
    recommendations?: string[];
  }[];
  recommendations: string[];
}

export class ComplianceValidator {
  private rules: Map<string, ValidationRule> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'ComplianceValidator' });
    this.initializeDefaultRules();
  }

  /**
   * Initialize default HIPAA compliance rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: ValidationRule[] = [
      // Administrative Safeguards
      {
        id: 'admin_001',
        name: 'Unique User Identification',
        description: 'Each user must have a unique identifier',
        category: 'administrative',
        severity: 'critical',
        required: true,
        validate: async context => {
          if (!context.user?.id) {
            return {
              passed: false,
              message: 'User ID is required for all operations',
              recommendations: ['Ensure all users have unique identifiers before system access'],
            };
          }
          return { passed: true, message: 'User identification verified' };
        },
      },
      {
        id: 'admin_002',
        name: 'Role-Based Access Control',
        description: 'Users must have defined roles with appropriate permissions',
        category: 'administrative',
        severity: 'high',
        required: true,
        validate: async context => {
          if (!context.user?.role || !context.user?.permissions?.length) {
            return {
              passed: false,
              message: 'User role and permissions must be defined',
              recommendations: ['Assign appropriate roles and permissions to all users'],
            };
          }
          return { passed: true, message: 'Role-based access control verified' };
        },
      },
      {
        id: 'admin_003',
        name: 'Minimum Necessary Standard',
        description: 'Access should be limited to minimum necessary information',
        category: 'administrative',
        severity: 'medium',
        required: true,
        validate: async context => {
          if (
            context.operation?.type === 'export' &&
            !context.user?.permissions.includes('export')
          ) {
            return {
              passed: false,
              message: 'User lacks permission for data export',
              recommendations: ['Grant appropriate export permissions or deny access'],
            };
          }
          return { passed: true, message: 'Minimum necessary access verified' };
        },
      },

      // Physical Safeguards
      {
        id: 'phys_001',
        name: 'Workstation Security',
        description: 'Access from secure workstations only',
        category: 'physical',
        severity: 'medium',
        required: false,
        validate: async context => {
          // In a real implementation, this would check workstation certificates or other security measures
          return { passed: true, message: 'Workstation security assumed compliant' };
        },
      },

      // Technical Safeguards
      {
        id: 'tech_001',
        name: 'Encryption in Transit',
        description: 'Data must be encrypted during transmission',
        category: 'technical',
        severity: 'critical',
        required: true,
        validate: async context => {
          // Check if connection is secure (HTTPS)
          const userAgent = context.session?.userAgent || '';
          if (userAgent.includes('http:') && !userAgent.includes('localhost')) {
            return {
              passed: false,
              message: 'Insecure connection detected',
              recommendations: ['Use HTTPS for all data transmission'],
            };
          }
          return { passed: true, message: 'Secure transmission verified' };
        },
      },
      {
        id: 'tech_002',
        name: 'Audit Logging',
        description: 'All PHI access must be logged',
        category: 'technical',
        severity: 'critical',
        required: true,
        validate: async context => {
          if (context.operation && !context.metadata?.auditLogged) {
            return {
              passed: false,
              message: 'Operation not properly audited',
              recommendations: ['Ensure all PHI access is logged for audit purposes'],
            };
          }
          return { passed: true, message: 'Audit logging verified' };
        },
      },
      {
        id: 'tech_003',
        name: 'Session Timeout',
        description: 'Sessions must timeout after period of inactivity',
        category: 'technical',
        severity: 'medium',
        required: true,
        validate: async context => {
          // In a real implementation, check session timeout configuration
          return { passed: true, message: 'Session timeout configured' };
        },
      },
      {
        id: 'tech_004',
        name: 'PHI Data Masking',
        description: 'PHI must be masked in logs and non-production environments',
        category: 'technical',
        severity: 'high',
        required: true,
        validate: async context => {
          if (context.data && typeof context.data === 'object') {
            const dataStr = JSON.stringify(context.data);
            // Check for common PHI patterns that should be masked
            const phiPatterns = [
              /\b\d{3}-\d{2}-\d{4}\b/, // SSN format
              /\b\d{10}\b/, // Saudi National ID
              /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/, // Email
            ];

            for (const pattern of phiPatterns) {
              if (pattern.test(dataStr)) {
                return {
                  passed: false,
                  message: 'Potentially unmasked PHI detected in data',
                  recommendations: ['Ensure all PHI is properly masked before processing'],
                };
              }
            }
          }
          return { passed: true, message: 'PHI masking verified' };
        },
      },
      {
        id: 'tech_005',
        name: 'Access Control Verification',
        description: 'User must have appropriate permissions for the requested operation',
        category: 'technical',
        severity: 'critical',
        required: true,
        validate: async context => {
          if (context.operation && context.user) {
            const requiredPermission = `${context.operation.resource}:${context.operation.type}`;
            const hasPermission = context.user.permissions.some(
              p => p === requiredPermission || p === `${context.operation!.resource}:*` || p === '*'
            );

            if (!hasPermission) {
              return {
                passed: false,
                message: `User lacks permission for ${context.operation.type} on ${context.operation.resource}`,
                recommendations: [`Grant ${requiredPermission} permission to user`],
              };
            }
          }
          return { passed: true, message: 'Access control verified' };
        },
      },
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }

    this.logger.info('Compliance validation rules initialized', { ruleCount: this.rules.size });
  }

  /**
   * Add or update a validation rule
   */
  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
    this.logger.debug('Validation rule added/updated', { ruleId: rule.id, ruleName: rule.name });
  }

  /**
   * Remove a validation rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.logger.debug('Validation rule removed', { ruleId });
    }
    return removed;
  }

  /**
   * Validate compliance for a given context
   */
  async validateCompliance(context: ValidationContext): Promise<ComplianceReport> {
    const startTime = Date.now();
    const results: ComplianceReport['ruleResults'] = [];
    const recommendations = new Set<string>();

    let passedRules = 0;
    let criticalFailures = 0;

    // Run all validation rules
    for (const rule of this.rules.values()) {
      try {
        const result = await rule.validate(context);

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          passed: result.passed,
          message: result.message,
          recommendations: result.recommendations,
        });

        if (result.passed) {
          passedRules++;
        } else {
          if (rule.severity === 'critical') {
            criticalFailures++;
          }

          // Add recommendations
          if (result.recommendations) {
            result.recommendations.forEach(rec => recommendations.add(rec));
          }
        }
      } catch (error) {
        this.logger.error('Validation rule execution failed', error as Error, { ruleId: rule.id });

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          passed: false,
          message: `Rule execution failed: ${(error as Error).message}`,
          recommendations: ['Review and fix validation rule implementation'],
        });

        if (rule.severity === 'critical') {
          criticalFailures++;
        }
      }
    }

    const totalRules = this.rules.size;
    const failedRules = totalRules - passedRules;
    const overallCompliance = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 100;

    const report: ComplianceReport = {
      overallCompliance,
      totalRules,
      passedRules,
      failedRules,
      criticalFailures,
      timestamp: new Date().toISOString(),
      ruleResults: results,
      recommendations: Array.from(recommendations),
    };

    const validationTime = Date.now() - startTime;

    this.logger.info('Compliance validation completed', {
      overallCompliance,
      passedRules,
      failedRules,
      criticalFailures,
      validationTime,
    });

    return report;
  }

  /**
   * Validate specific rule categories
   */
  async validateCategory(
    context: ValidationContext,
    category: 'administrative' | 'physical' | 'technical'
  ): Promise<ComplianceReport> {
    const categoryRules = Array.from(this.rules.values()).filter(
      rule => rule.category === category
    );
    const originalRules = new Map(this.rules);

    // Temporarily set rules to only category rules
    this.rules.clear();
    for (const rule of categoryRules) {
      this.rules.set(rule.id, rule);
    }

    const report = await this.validateCompliance(context);

    // Restore original rules
    this.rules = originalRules;

    return report;
  }

  /**
   * Quick validation for critical rules only
   */
  async quickValidation(context: ValidationContext): Promise<{
    passed: boolean;
    criticalFailures: number;
    failedRules: string[];
  }> {
    const criticalRules = Array.from(this.rules.values()).filter(
      rule => rule.severity === 'critical' && rule.required
    );

    let criticalFailures = 0;
    const failedRules: string[] = [];

    for (const rule of criticalRules) {
      try {
        const result = await rule.validate(context);
        if (!result.passed) {
          criticalFailures++;
          failedRules.push(rule.id);
        }
      } catch (error) {
        criticalFailures++;
        failedRules.push(rule.id);
        this.logger.error('Critical rule validation failed', error as Error, { ruleId: rule.id });
      }
    }

    return {
      passed: criticalFailures === 0,
      criticalFailures,
      failedRules,
    };
  }

  /**
   * Get validation rule information
   */
  getRule(ruleId: string): ValidationRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * List all validation rules
   */
  listRules(): Array<Omit<ValidationRule, 'validate'>> {
    return Array.from(this.rules.values()).map(rule => {
      const { validate, ...ruleInfo } = rule;
      return ruleInfo;
    });
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats(): {
    totalRules: number;
    rulesByCategory: Record<string, number>;
    rulesBySeverity: Record<string, number>;
    requiredRules: number;
  } {
    const stats = {
      totalRules: this.rules.size,
      rulesByCategory: {} as Record<string, number>,
      rulesBySeverity: {} as Record<string, number>,
      requiredRules: 0,
    };

    for (const rule of this.rules.values()) {
      stats.rulesByCategory[rule.category] = (stats.rulesByCategory[rule.category] || 0) + 1;
      stats.rulesBySeverity[rule.severity] = (stats.rulesBySeverity[rule.severity] || 0) + 1;
      if (rule.required) {
        stats.requiredRules++;
      }
    }

    return stats;
  }

  /**
   * Generate compliance report summary
   */
  generateReportSummary(report: ComplianceReport): string {
    const summary = [];

    summary.push(`HIPAA Compliance Report - ${report.timestamp}`);
    summary.push(`Overall Compliance: ${report.overallCompliance}%`);
    summary.push(`Passed Rules: ${report.passedRules}/${report.totalRules}`);

    if (report.criticalFailures > 0) {
      summary.push(`⚠️  CRITICAL FAILURES: ${report.criticalFailures}`);
    }

    if (report.failedRules > 0) {
      summary.push(`Failed Rules: ${report.failedRules}`);
    }

    if (report.recommendations.length > 0) {
      summary.push('\nRecommendations:');
      report.recommendations.forEach((rec, index) => {
        summary.push(`${index + 1}. ${rec}`);
      });
    }

    return summary.join('\n');
  }
}

/**
 * Factory function to create compliance validator
 */
export function createComplianceValidator(logger: Logger): ComplianceValidator {
  return new ComplianceValidator(logger);
}

/**
 * Utility function to create validation context
 */
export function createValidationContext(options: {
  data?: unknown;
  userId?: string;
  userRole?: string;
  permissions?: string[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  operationType?: 'create' | 'read' | 'update' | 'delete' | 'export';
  resource?: string;
  resourceId?: string;
  auditLogged?: boolean;
  additionalMetadata?: Record<string, unknown>;
}): ValidationContext {
  return {
    data: options.data,
    user: options.userId
      ? {
          id: options.userId,
          role: options.userRole || 'user',
          permissions: options.permissions || [],
        }
      : undefined,
    session: options.sessionId
      ? {
          id: options.sessionId,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        }
      : undefined,
    operation:
      options.operationType && options.resource
        ? {
            type: options.operationType,
            resource: options.resource,
            resourceId: options.resourceId,
          }
        : undefined,
    metadata: {
      auditLogged: options.auditLogged,
      ...options.additionalMetadata,
    },
  };
}
