'use strict';

/**
 * Advanced Authentication & Authorization Manager
 * Provides JWT, OAuth2, MFA, session management, and RBAC
 */

class AuthenticationManager {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.roles = this.initializeRoles();
    this.sessions = new Map();
  }

  /**
   * Initialize role-based access control
   */
  initializeRoles() {
    return {
      superadmin: {
        permissions: ['*'],
        description: 'Full system access',
        level: 10,
      },
      admin: {
        permissions: [
          'users:*',
          'patients:*',
          'fhir:*',
          'reports:*',
          'settings:*',
        ],
        description: 'Administrative access',
        level: 8,
      },
      physician: {
        permissions: [
          'patients:read',
          'patients:write',
          'fhir:read',
          'fhir:write',
          'prescriptions:*',
          'diagnoses:*',
        ],
        description: 'Clinical staff with full patient access',
        level: 7,
      },
      nurse: {
        permissions: [
          'patients:read',
          'patients:update',
          'vitals:*',
          'medications:administer',
          'observations:*',
        ],
        description: 'Nursing staff access',
        level: 6,
      },
      pharmacist: {
        permissions: [
          'patients:read',
          'medications:*',
          'prescriptions:verify',
          'inventory:*',
        ],
        description: 'Pharmacy access',
        level: 5,
      },
      receptionist: {
        permissions: [
          'patients:create',
          'patients:read',
          'appointments:*',
          'demographics:*',
        ],
        description: 'Front desk access',
        level: 3,
      },
      patient: {
        permissions: [
          'self:read',
          'appointments:read',
          'reports:read',
          'messages:*',
        ],
        description: 'Patient portal access',
        level: 1,
      },
    };
  }

  /**
   * User login with credentials
   */
  async login(username, password, options = {}) {
    // Simulate API call
    await this.simulateDelay(1000);

    // In production, validate against backend
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Mock user data
    const user = {
      id: 'user_' + Date.now(),
      username,
      email: `${username}@brainsait.com`,
      role: options.role || 'physician',
      firstName: 'Dr.',
      lastName: username.charAt(0).toUpperCase() + username.slice(1),
      department: 'Internal Medicine',
      licenseNumber: 'SA-MED-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      verified: true,
      mfaEnabled: options.mfaEnabled !== false,
    };

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Create session
    const session = {
      id: 'session_' + Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
      isActive: true,
    };

    // Store session
    this.sessions.set(session.id, session);
    this.currentUser = user;
    this.session = session;

    // Store in localStorage (in production, use secure httpOnly cookies)
    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('session', JSON.stringify(session));

    return {
      user,
      tokens,
      session,
      requiresMFA: user.mfaEnabled && !options.mfaVerified,
    };
  }

  /**
   * OAuth2 login (Google, Microsoft, etc.)
   */
  async loginWithOAuth(provider, options = {}) {
    await this.simulateDelay(1500);

    // Mock OAuth flow
    const user = {
      id: 'oauth_' + Date.now(),
      username: `${provider}_user`,
      email: `user@${provider}.com`,
      role: 'physician',
      firstName: 'OAuth',
      lastName: 'User',
      provider,
      verified: true,
      mfaEnabled: false,
    };

    const tokens = this.generateTokens(user);
    const session = this.createSession(user);

    this.currentUser = user;
    this.session = session;

    this.storeAuthData(user, tokens, session);

    return { user, tokens, session };
  }

  /**
   * Multi-factor authentication verification
   */
  async verifyMFA(code, method = 'totp') {
    await this.simulateDelay(800);

    // Simulate MFA verification
    const validCode = '123456'; // In production, verify against backend

    if (code !== validCode) {
      throw new Error('Invalid MFA code');
    }

    return {
      verified: true,
      method,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Biometric authentication (Face ID, Touch ID, etc.)
   */
  async authenticateWithBiometric() {
    if (!window.PublicKeyCredential) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      await this.simulateDelay(1000);

      // In production, use WebAuthn API
      return {
        authenticated: true,
        method: 'biometric',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Biometric authentication failed');
    }
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user) {
    // In production, generate real JWT tokens on backend
    const accessToken = this.encodeToken({
      sub: user.id,
      username: user.username,
      role: user.role,
      permissions: this.roles[user.role]?.permissions || [],
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iat: Math.floor(Date.now() / 1000),
    });

    const refreshToken = this.encodeToken({
      sub: user.id,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      iat: Math.floor(Date.now() / 1000),
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  /**
   * Simple token encoding (base64) - in production use real JWT
   */
  encodeToken(payload) {
    return 'eyJ' + btoa(JSON.stringify(payload)).replace(/=/g, '');
  }

  /**
   * Decode token
   */
  decodeToken(token) {
    try {
      const payload = token.substring(3);
      return JSON.parse(atob(payload));
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    await this.simulateDelay(500);

    try {
      const payload = this.decodeToken(refreshToken);

      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Refresh token expired');
      }

      // Get user data
      const user = this.currentUser || JSON.parse(localStorage.getItem('user'));

      // Generate new access token
      const tokens = this.generateTokens(user);

      // Update stored token
      localStorage.setItem('auth_token', tokens.accessToken);

      return tokens;
    } catch (error) {
      throw new Error('Failed to refresh token: ' + error.message);
    }
  }

  /**
   * Validate token
   */
  validateToken(token) {
    try {
      const payload = this.decodeToken(token);

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, reason: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Check user permission
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;

    const userRole = this.roles[this.currentUser.role];
    if (!userRole) return false;

    // Check for wildcard permission
    if (userRole.permissions.includes('*')) return true;

    // Check for exact match
    if (userRole.permissions.includes(permission)) return true;

    // Check for wildcard in category (e.g., 'patients:*')
    const [category] = permission.split(':');
    if (userRole.permissions.includes(`${category}:*`)) return true;

    return false;
  }

  /**
   * Get user permissions
   */
  getUserPermissions() {
    if (!this.currentUser) return [];

    const userRole = this.roles[this.currentUser.role];
    return userRole?.permissions || [];
  }

  /**
   * Create session
   */
  createSession(user) {
    const session = {
      id: 'session_' + Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
      isActive: true,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get active sessions
   */
  getActiveSessions(userId) {
    const sessions = [];
    for (const [, session] of this.sessions) {
      if (session.userId === userId && session.isActive) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  /**
   * Revoke session
   */
  revokeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.revokedAt = new Date().toISOString();
    }
  }

  /**
   * Logout
   */
  async logout() {
    await this.simulateDelay(300);

    // Revoke current session
    if (this.session) {
      this.revokeSession(this.session.id);
    }

    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session');

    this.currentUser = null;
    this.session = null;

    return { success: true };
  }

  /**
   * Store auth data
   */
  storeAuthData(user, tokens, session) {
    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('session', JSON.stringify(session));
  }

  /**
   * Restore session from storage
   */
  restoreSession() {
    try {
      const token = localStorage.getItem('auth_token');
      const user = JSON.parse(localStorage.getItem('user'));
      const session = JSON.parse(localStorage.getItem('session'));

      if (!token || !user || !session) {
        return null;
      }

      const validation = this.validateToken(token);
      if (!validation.valid) {
        this.logout();
        return null;
      }

      this.currentUser = user;
      this.session = session;

      return { user, session };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    await this.simulateDelay(500);

    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('user', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword, newPassword) {
    await this.simulateDelay(800);

    // In production, validate old password and update on backend

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    await this.simulateDelay(1000);

    // In production, send reset email

    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  /**
   * Audit log action
   */
  logAudit(action, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: this.currentUser?.id,
      username: this.currentUser?.username,
      action,
      details,
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
    };

    console.log('[AUDIT]', logEntry);

    // In production, send to audit logging service
    return logEntry;
  }

  /**
   * Simulate async delay
   */
  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in demo.js
window.AuthenticationManager = AuthenticationManager;
