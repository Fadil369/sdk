/**
 * HIPAA-compliant session management for healthcare applications
 */

import { Logger } from '@/core/logger';
import { v4 as uuidv4 } from 'uuid';

export interface SessionConfig {
  maxDuration: number; // minutes
  idleTimeout: number; // minutes
  maxConcurrentSessions: number;
  secureTransport: boolean;
  sessionTokenLength: number;
  renewBeforeExpiry: number; // minutes
}

export interface SessionData {
  sessionId: string;
  userId: string;
  userRole: string;
  permissions: string[];
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface SessionEvent {
  sessionId: string;
  eventType: 'created' | 'renewed' | 'expired' | 'terminated' | 'activity';
  timestamp: string;
  details?: Record<string, unknown>;
}

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds
  private config: SessionConfig;
  private logger: Logger;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: SessionConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ component: 'SessionManager' });
    this.startCleanupProcess();
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    userRole: string,
    permissions: string[],
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      additionalData?: Record<string, unknown>;
    }
  ): Promise<SessionData> {
    // Check concurrent session limit
    const existingSessions = this.getUserSessions(userId);
    if (existingSessions.length >= this.config.maxConcurrentSessions) {
      // Terminate oldest session
      const oldestSession = existingSessions.sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      )[0];
      if (oldestSession) {
        await this.terminateSession(oldestSession.sessionId, 'concurrent_limit_exceeded');
      }
    }

    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.maxDuration * 60 * 1000);

    const sessionData: SessionData = {
      userId,
      userRole,
      sessionId,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata: metadata ?? {},
      permissions: [],
    };

    // Store session
    this.sessions.set(sessionId, sessionData);

    // Update user sessions tracking
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    const userSessions = this.userSessions.get(userId);
    userSessions?.add(sessionId);

    // Log session creation
    this.logger.info('Session created', {
      sessionId,
      userId,
      userRole,
      expiresAt: sessionData.expiresAt,
      ipAddress: metadata?.ipAddress,
    });

    this.logSessionEvent(sessionId, 'created', {
      userId,
      userRole,
      ipAddress: metadata?.ipAddress,
    });

    return sessionData;
  }

  /**
   * Validate and retrieve session
   */
  async validateSession(sessionId: string, ipAddress?: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Session validation failed - not found', { sessionId });
      return null;
    }

    // Check if session is active
    if (!session.isActive) {
      this.logger.warn('Session validation failed - inactive', { sessionId });
      return null;
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      this.logger.warn('Session validation failed - expired', { sessionId });
      await this.terminateSession(sessionId, 'expired');
      return null;
    }

    // Check idle timeout
    const lastActivity = new Date(session.lastActivity);
    const idleTime = Date.now() - lastActivity.getTime();
    const idleTimeoutMs = this.config.idleTimeout * 60 * 1000;

    if (idleTime > idleTimeoutMs) {
      this.logger.warn('Session validation failed - idle timeout', {
        sessionId,
        idleTime: Math.round(idleTime / 1000),
      });
      await this.terminateSession(sessionId, 'idle_timeout');
      return null;
    }

    // Check IP address consistency (if configured)
    if (
      this.config.secureTransport &&
      session.ipAddress &&
      ipAddress &&
      session.ipAddress !== ipAddress
    ) {
      this.logger.warn('Session validation failed - IP mismatch', {
        sessionId,
        originalIp: session.ipAddress,
        currentIp: ipAddress,
      });
      await this.terminateSession(sessionId, 'ip_mismatch');
      return null;
    }

    // Update last activity
    session.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);

    this.logSessionEvent(sessionId, 'activity', { ipAddress });

    return session;
  }

  /**
   * Renew session (extend expiration)
   */
  async renewSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.validateSession(sessionId);
    if (!session) {
      return null;
    }

    // Check if renewal is needed
    const expiresAt = new Date(session.expiresAt);
    const renewThreshold = new Date(Date.now() + this.config.renewBeforeExpiry * 60 * 1000);

    if (expiresAt > renewThreshold) {
      // Session doesn't need renewal yet
      return session;
    }

    // Extend session
    const newExpiresAt = new Date(Date.now() + this.config.maxDuration * 60 * 1000);
    session.expiresAt = newExpiresAt.toISOString();
    this.sessions.set(sessionId, session);

    this.logger.info('Session renewed', {
      sessionId,
      userId: session.userId,
      newExpiresAt: session.expiresAt,
    });

    this.logSessionEvent(sessionId, 'renewed', {
      newExpiresAt: session.expiresAt,
    });

    return session;
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Mark as inactive
    session.isActive = false;
    this.sessions.set(sessionId, session);

    // Remove from user sessions tracking
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    const terminationReason = reason ?? 'manual';

    this.logger.info('Session terminated', {
      sessionId,
      userId: session.userId,
      reason: terminationReason,
    });

    this.logSessionEvent(sessionId, 'terminated', { reason: terminationReason });

    // Remove session after a delay (for audit purposes)
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 60000); // Keep for 1 minute

    return true;
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateUserSessions(userId: string, except?: string): Promise<number> {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) {
      return 0;
    }

    const sessionsToTerminate = Array.from(userSessionIds).filter(
      sessionId => !except || sessionId !== except
    );

    if (sessionsToTerminate.length === 0) {
      return 0;
    }

    const terminationResults = await Promise.all(
      sessionsToTerminate.map(sessionId =>
        this.terminateSession(sessionId, 'user_sessions_terminated')
      )
    );

    const terminatedCount = terminationResults.reduce(
      (count, terminated) => count + (terminated ? 1 : 0),
      0
    );

    this.logger.info('User sessions terminated', { userId, terminatedCount });

    return terminatedCount;
  }

  /**
   * Get active sessions for a user
   */
  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }

    const sessions: SessionData[] = [];
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Get session information (without sensitive data)
   */
  getSessionInfo(sessionId: string): Omit<SessionData, 'metadata'> | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const { metadata: _metadata, ...sessionInfo } = session;
    return sessionInfo;
  }

  /**
   * Get all active sessions (admin function)
   */
  getAllActiveSessions(): Array<Omit<SessionData, 'metadata'>> {
    const activeSessions: Array<Omit<SessionData, 'metadata'>> = [];

    for (const session of this.sessions.values()) {
      if (session.isActive && new Date(session.expiresAt) > new Date()) {
        const { metadata: _metadata, ...sessionInfo } = session;
        activeSessions.push(sessionInfo);
      }
    }

    return activeSessions.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }

  /**
   * Update session permissions
   */
  async updateSessionPermissions(sessionId: string, permissions: string[]): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    session.permissions = [...permissions];
    session.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);

    this.logger.info('Session permissions updated', {
      sessionId,
      userId: session.userId,
      permissionCount: permissions.length,
    });

    return true;
  }

  /**
   * Check if session has specific permission
   */
  hasPermission(sessionId: string, permission: string): boolean {
    const session = this.sessions.get(sessionId);
    return Boolean(session?.isActive && session.permissions.includes(permission));
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    userCount: number;
    averageSessionDuration: number;
    sessionsPerUser: Record<string, number>;
  } {
    const stats = {
      totalSessions: this.sessions.size,
      activeSessions: 0,
      expiredSessions: 0,
      userCount: this.userSessions.size,
      averageSessionDuration: 0,
      sessionsPerUser: {} as Record<string, number>,
    };

    let totalDuration = 0;
    const now = new Date();

    for (const session of this.sessions.values()) {
      if (session.isActive && new Date(session.expiresAt) > now) {
        stats.activeSessions++;
      } else {
        stats.expiredSessions++;
      }

      // Calculate session duration
      const created = new Date(session.createdAt);
      const lastActivity = new Date(session.lastActivity);
      const duration = lastActivity.getTime() - created.getTime();
      totalDuration += duration;

      // Count sessions per user
      stats.sessionsPerUser[session.userId] = (stats.sessionsPerUser[session.userId] ?? 0) + 1;
    }

    stats.averageSessionDuration =
      stats.totalSessions > 0
        ? Math.round(totalDuration / stats.totalSessions / 1000 / 60) // minutes
        : 0;

    return stats;
  }

  /**
   * Start automatic cleanup process
   */
  private startCleanupProcess(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        void this.cleanupExpiredSessions().catch(error => {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error('Session cleanup failed', err);
        });
      },
      5 * 60 * 1000
    );

    this.logger.info('Session cleanup process started');
  }

  /**
   * Stop cleanup process
   */
  stopCleanupProcess(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.info('Session cleanup process stopped');
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const sessionsToCleanup: Array<{ sessionId: string; reason: 'expired' | 'idle_timeout' }> = [];

    // First pass: identify sessions to cleanup (no async operations)
    for (const [sessionId, session] of this.sessions.entries()) {
      const isExpired = new Date(session.expiresAt) < now;
      const isIdle =
        now.getTime() - new Date(session.lastActivity).getTime() >
        this.config.idleTimeout * 60 * 1000;

      if (isExpired || isIdle) {
        sessionsToCleanup.push({
          sessionId,
          reason: isExpired ? 'expired' : 'idle_timeout',
        });
      }
    }

    // Second pass: cleanup sessions in parallel
    if (sessionsToCleanup.length > 0) {
      await Promise.allSettled(
        sessionsToCleanup.map(({ sessionId, reason }) => this.terminateSession(sessionId, reason))
      );

      this.logger.info('Expired sessions cleaned up', {
        cleanedCount: sessionsToCleanup.length,
      });
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    // In production, use crypto.randomBytes for better security
    const uuid = uuidv4();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);

    return `sess_${uuid}_${timestamp}_${random}`.substring(0, this.config.sessionTokenLength ?? 64);
  }

  /**
   * Log session events for audit
   */
  private logSessionEvent(
    sessionId: string,
    eventType: SessionEvent['eventType'],
    details?: Record<string, unknown>
  ): void {
    const event: SessionEvent = {
      sessionId,
      eventType,
      timestamp: new Date().toISOString(),
      details,
    };

    this.logger.debug('Session event', event);
  }

  /**
   * Shutdown session manager
   */
  async shutdown(): Promise<void> {
    this.stopCleanupProcess();

    // Terminate all active sessions
    const activeSessions = this.getAllActiveSessions();

    if (activeSessions.length > 0) {
      await Promise.all(
        activeSessions.map(session => this.terminateSession(session.sessionId, 'system_shutdown'))
      );
    }

    this.logger.info('Session manager shutdown complete');
  }
}

/**
 * Factory function to create session manager
 */
export function createSessionManager(config: SessionConfig, logger: Logger): SessionManager {
  return new SessionManager(config, logger);
}

/**
 * Default session configuration for healthcare applications
 */
export const defaultSessionConfig: SessionConfig = {
  maxDuration: 480, // 8 hours
  idleTimeout: 30, // 30 minutes
  maxConcurrentSessions: 3,
  secureTransport: true,
  sessionTokenLength: 64,
  renewBeforeExpiry: 60, // 1 hour
};
