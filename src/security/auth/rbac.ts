/**
 * Role-Based Access Control (RBAC) system for healthcare applications
 */

import { Logger } from '@/core/logger';
import { RoleBasedAccess, Permission, PermissionCondition, Restriction } from '@/types/security';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  restrictions?: Restriction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  username: string;
  roles: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface AccessContext {
  userId: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'search';
  resourceId?: string;
  data?: Record<string, unknown>;
  environment?: Record<string, unknown>;
}

export interface AccessResult {
  granted: boolean;
  reason: string;
  matchedPermissions: Permission[];
  appliedRestrictions: Restriction[];
  conditions?: PermissionCondition[];
}

export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private users: Map<string, User> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'RBACManager' });
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default healthcare roles
   */
  private initializeDefaultRoles(): void {
    const defaultRoles: Omit<Role, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'admin',
        name: 'System Administrator',
        description: 'Full system access with administrative privileges',
        isActive: true,
        permissions: [
          {
            resource: '*',
            actions: ['create', 'read', 'update', 'delete', 'search'],
          },
        ],
      },
      {
        id: 'physician',
        name: 'Physician',
        description: 'Healthcare provider with patient care access',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'Observation',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'DiagnosticReport',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'Medication',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'Procedure',
            actions: ['create', 'read', 'update', 'search'],
          },
        ],
        restrictions: [
          {
            type: 'data_access',
            rule: 'own_patients_only',
            description: 'Can only access patients under their care',
          },
        ],
      },
      {
        id: 'nurse',
        name: 'Nurse',
        description: 'Nursing staff with patient care access',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['read', 'update', 'search'],
          },
          {
            resource: 'Observation',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'Medication',
            actions: ['read', 'search'],
          },
        ],
        restrictions: [
          {
            type: 'data_access',
            rule: 'assigned_patients_only',
            description: 'Can only access patients assigned to their care',
          },
        ],
      },
      {
        id: 'pharmacist',
        name: 'Pharmacist',
        description: 'Pharmacy staff with medication access',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['read', 'search'],
            conditions: [
              {
                field: 'accessReason',
                operator: 'equals',
                value: 'medication_dispensing',
              },
            ],
          },
          {
            resource: 'Medication',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'MedicationDispense',
            actions: ['create', 'read', 'update', 'search'],
          },
        ],
      },
      {
        id: 'receptionist',
        name: 'Receptionist',
        description: 'Front desk staff with limited patient access',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['create', 'read', 'update', 'search'],
            conditions: [
              {
                field: 'dataType',
                operator: 'in',
                value: ['demographics', 'contact', 'insurance'],
              },
            ],
          },
          {
            resource: 'Appointment',
            actions: ['create', 'read', 'update', 'delete', 'search'],
          },
        ],
        restrictions: [
          {
            type: 'field_access',
            rule: 'no_clinical_data',
            description: 'Cannot access clinical information',
          },
        ],
      },
      {
        id: 'lab_tech',
        name: 'Laboratory Technician',
        description: 'Laboratory staff with diagnostic access',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['read', 'search'],
            conditions: [
              {
                field: 'accessReason',
                operator: 'equals',
                value: 'lab_testing',
              },
            ],
          },
          {
            resource: 'DiagnosticReport',
            actions: ['create', 'read', 'update', 'search'],
          },
          {
            resource: 'Specimen',
            actions: ['create', 'read', 'update', 'search'],
          },
        ],
      },
      {
        id: 'auditor',
        name: 'Compliance Auditor',
        description: 'Audit staff with read-only access',
        isActive: true,
        permissions: [
          {
            resource: '*',
            actions: ['read', 'search'],
          },
        ],
        restrictions: [
          {
            type: 'access_mode',
            rule: 'read_only',
            description: 'Read-only access for audit purposes',
          },
        ],
      },
      {
        id: 'patient',
        name: 'Patient',
        description: 'Patient with access to own health records',
        isActive: true,
        permissions: [
          {
            resource: 'Patient',
            actions: ['read'],
            conditions: [
              {
                field: 'patientId',
                operator: 'equals',
                value: 'self',
              },
            ],
          },
          {
            resource: 'Observation',
            actions: ['read'],
            conditions: [
              {
                field: 'subject.reference',
                operator: 'equals',
                value: 'self',
              },
            ],
          },
          {
            resource: 'DiagnosticReport',
            actions: ['read'],
            conditions: [
              {
                field: 'subject.reference',
                operator: 'equals',
                value: 'self',
              },
            ],
          },
        ],
        restrictions: [
          {
            type: 'data_access',
            rule: 'own_data_only',
            description: 'Can only access own health information',
          },
        ],
      },
    ];

    const now = new Date().toISOString();
    for (const roleData of defaultRoles) {
      const role: Role = {
        ...roleData,
        createdAt: now,
        updatedAt: now,
      };
      this.roles.set(role.id, role);
    }

    this.logger.info('Default RBAC roles initialized', { roleCount: this.roles.size });
  }

  /**
   * Create a new role
   */
  async createRole(roleData: Omit<Role, 'createdAt' | 'updatedAt'>): Promise<Role> {
    if (this.roles.has(roleData.id)) {
      throw new Error(`Role already exists: ${roleData.id}`);
    }

    const now = new Date().toISOString();
    const role: Role = {
      ...roleData,
      createdAt: now,
      updatedAt: now,
    };

    this.roles.set(role.id, role);

    this.logger.info('Role created', {
      roleId: role.id,
      roleName: role.name,
      permissionCount: role.permissions.length,
    });

    return role;
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, updates: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role | null> {
    const existingRole = this.roles.get(roleId);
    if (!existingRole) {
      return null;
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.roles.set(roleId, updatedRole);

    this.logger.info('Role updated', {
      roleId,
      updatedFields: Object.keys(updates),
    });

    return updatedRole;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<boolean> {
    const deleted = this.roles.delete(roleId);
    
    if (deleted) {
      // Remove role from all users
      for (const user of this.users.values()) {
        const roleIndex = user.roles.indexOf(roleId);
        if (roleIndex > -1) {
          user.roles.splice(roleIndex, 1);
        }
      }

      this.logger.info('Role deleted', { roleId });
    }

    return deleted;
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | null {
    return this.roles.get(roleId) || null;
  }

  /**
   * List all roles
   */
  listRoles(activeOnly = false): Role[] {
    const roles = Array.from(this.roles.values());
    return activeOnly ? roles.filter(role => role.isActive) : roles;
  }

  /**
   * Create or update a user
   */
  async setUser(userData: User): Promise<User> {
    // Validate that all assigned roles exist
    for (const roleId of userData.roles) {
      if (!this.roles.has(roleId)) {
        throw new Error(`Role not found: ${roleId}`);
      }
    }

    this.users.set(userData.id, userData);

    this.logger.info('User set', {
      userId: userData.id,
      username: userData.username,
      roleCount: userData.roles.length,
    });

    return userData;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Remove a user
   */
  async removeUser(userId: string): Promise<boolean> {
    const deleted = this.users.delete(userId);
    
    if (deleted) {
      this.logger.info('User removed', { userId });
    }

    return deleted;
  }

  /**
   * Check if user has access to perform an action
   */
  async checkAccess(context: AccessContext): Promise<AccessResult> {
    const user = this.users.get(context.userId);
    if (!user || !user.isActive) {
      return {
        granted: false,
        reason: 'User not found or inactive',
        matchedPermissions: [],
        appliedRestrictions: [],
      };
    }

    const matchedPermissions: Permission[] = [];
    const appliedRestrictions: Restriction[] = [];
    let hasPermission = false;

    // Check permissions from all user roles
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (!role || !role.isActive) {
        continue;
      }

      // Check role permissions
      for (const permission of role.permissions) {
        if (this.matchesPermission(permission, context)) {
          matchedPermissions.push(permission);
          
          // Check permission conditions
          if (!permission.conditions || this.evaluateConditions(permission.conditions, context)) {
            hasPermission = true;
          }
        }
      }

      // Collect restrictions
      if (role.restrictions) {
        appliedRestrictions.push(...role.restrictions);
      }
    }

    if (!hasPermission) {
      return {
        granted: false,
        reason: 'No matching permissions found',
        matchedPermissions,
        appliedRestrictions,
      };
    }

    // Check restrictions
    const restrictionViolation = this.checkRestrictions(appliedRestrictions, context);
    if (restrictionViolation) {
      return {
        granted: false,
        reason: `Restriction violation: ${restrictionViolation}`,
        matchedPermissions,
        appliedRestrictions,
      };
    }

    this.logger.debug('Access granted', {
      userId: context.userId,
      resource: context.resource,
      action: context.action,
      permissionCount: matchedPermissions.length,
      restrictionCount: appliedRestrictions.length,
    });

    return {
      granted: true,
      reason: 'Access granted based on role permissions',
      matchedPermissions,
      appliedRestrictions,
    };
  }

  /**
   * Get user permissions summary
   */
  getUserPermissions(userId: string): {
    roles: string[];
    permissions: Permission[];
    restrictions: Restriction[];
  } {
    const user = this.users.get(userId);
    if (!user) {
      return { roles: [], permissions: [], restrictions: [] };
    }

    const permissions: Permission[] = [];
    const restrictions: Restriction[] = [];

    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (role && role.isActive) {
        permissions.push(...role.permissions);
        if (role.restrictions) {
          restrictions.push(...role.restrictions);
        }
      }
    }

    return {
      roles: user.roles,
      permissions,
      restrictions,
    };
  }

  /**
   * Check if permission matches the access context
   */
  private matchesPermission(permission: Permission, context: AccessContext): boolean {
    // Check resource match
    if (permission.resource !== '*' && permission.resource !== context.resource) {
      return false;
    }

    // Check action match
    if (!permission.actions.includes(context.action)) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate permission conditions
   */
  private evaluateConditions(conditions: PermissionCondition[], context: AccessContext): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: PermissionCondition, context: AccessContext): boolean {
    let contextValue: unknown;

    // Handle special field values
    if (condition.field === 'patientId' && condition.value === 'self') {
      contextValue = context.userId;
    } else if (condition.field.includes('.')) {
      // Handle nested field access
      contextValue = this.getNestedValue(context.data || {}, condition.field);
    } else {
      contextValue = (context.data as any)?.[condition.field] || (context.environment as any)?.[condition.field];
    }

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'contains':
        return typeof contextValue === 'string' && 
               typeof condition.value === 'string' && 
               contextValue.includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }

  /**
   * Get nested value from an object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key: string) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Check if any restrictions are violated
   */
  private checkRestrictions(restrictions: Restriction[], context: AccessContext): string | null {
    for (const restriction of restrictions) {
      const violation = this.evaluateRestriction(restriction, context);
      if (violation) {
        return violation;
      }
    }
    return null;
  }

  /**
   * Evaluate a single restriction
   */
  private evaluateRestriction(restriction: Restriction, context: AccessContext): string | null {
    switch (restriction.rule) {
      case 'own_patients_only':
        // This would typically check if user is the attending physician
        // For now, we'll assume this check passes
        return null;
      
      case 'assigned_patients_only':
        // This would check if patient is assigned to the user
        // For now, we'll assume this check passes
        return null;
      
      case 'no_clinical_data':
        // Check if trying to access clinical data
        if (context.data && this.containsClinicalData(context.data)) {
          return 'Access to clinical data is restricted';
        }
        return null;
      
      case 'read_only':
        if (context.action !== 'read' && context.action !== 'search') {
          return 'Only read access is permitted';
        }
        return null;
      
      case 'own_data_only':
        // For patient role, ensure they can only access their own data
        if (context.userId !== context.resourceId && 
            !this.isSelfReference(context.data, context.userId)) {
          return 'Can only access own health information';
        }
        return null;
      
      default:
        return null;
    }
  }

  /**
   * Check if data contains clinical information
   */
  private containsClinicalData(data: Record<string, unknown>): boolean {
    const clinicalFields = [
      'diagnosis', 'procedure', 'medication', 'allergy', 
      'condition', 'observation', 'labResult', 'vitalSigns'
    ];
    
    const dataKeys = Object.keys(data).map(key => key.toLowerCase());
    return clinicalFields.some(field => 
      dataKeys.some(key => key.includes(field))
    );
  }

  /**
   * Check if data reference points to the user themselves
   */
  private isSelfReference(data: Record<string, unknown> | undefined, userId: string): boolean {
    if (!data) return false;
    
    const subjectRef = (data as any)?.subject?.reference;
    return subjectRef === `Patient/${userId}` || subjectRef === userId;
  }

  /**
   * Get RBAC statistics
   */
  getRBACStats(): {
    totalRoles: number;
    activeRoles: number;
    totalUsers: number;
    activeUsers: number;
    totalPermissions: number;
    totalRestrictions: number;
  } {
    const activeRoles = this.listRoles(true).length;
    const activeUsers = Array.from(this.users.values()).filter(user => user.isActive).length;
    
    let totalPermissions = 0;
    let totalRestrictions = 0;
    
    for (const role of this.roles.values()) {
      totalPermissions += role.permissions.length;
      totalRestrictions += role.restrictions?.length || 0;
    }

    return {
      totalRoles: this.roles.size,
      activeRoles,
      totalUsers: this.users.size,
      activeUsers,
      totalPermissions,
      totalRestrictions,
    };
  }
}

/**
 * Factory function to create RBAC manager
 */
export function createRBACManager(logger: Logger): RBACManager {
  return new RBACManager(logger);
}