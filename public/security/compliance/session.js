/**
 * HIPAA-compliant session management for healthcare applications
 */
import { v4 as uuidv4 } from 'uuid';
export class SessionManager {
    sessions = new Map();
    userSessions = new Map(); // userId -> sessionIds
    config;
    logger;
    cleanupInterval = null;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger.child({ component: 'SessionManager' });
        this.startCleanupProcess();
    }
    /**
     * Create a new session
     */
    async createSession(userId, userRole, permissions, metadata) {
        // Check concurrent session limit
        const existingSessions = this.getUserSessions(userId);
        if (existingSessions.length >= this.config.maxConcurrentSessions) {
            // Terminate oldest session
            const oldestSession = existingSessions.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
            if (oldestSession) {
                await this.terminateSession(oldestSession.sessionId, 'concurrent_limit_exceeded');
            }
        }
        const sessionId = this.generateSessionId();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.config.maxDuration * 60 * 1000);
        const sessionData = {
            sessionId,
            userId,
            userRole,
            permissions: [...permissions],
            createdAt: now.toISOString(),
            lastActivity: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            isActive: true,
            metadata: metadata?.additionalData,
        };
        // Store session
        this.sessions.set(sessionId, sessionData);
        // Update user sessions tracking
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId).add(sessionId);
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
    async validateSession(sessionId, ipAddress) {
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
        if (this.config.secureTransport &&
            session.ipAddress &&
            ipAddress &&
            session.ipAddress !== ipAddress) {
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
    async renewSession(sessionId) {
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
    async terminateSession(sessionId, reason) {
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
        this.logger.info('Session terminated', {
            sessionId,
            userId: session.userId,
            reason: reason || 'manual',
        });
        this.logSessionEvent(sessionId, 'terminated', { reason });
        // Remove session after a delay (for audit purposes)
        setTimeout(() => {
            this.sessions.delete(sessionId);
        }, 60000); // Keep for 1 minute
        return true;
    }
    /**
     * Terminate all sessions for a user
     */
    async terminateUserSessions(userId, except) {
        const userSessionIds = this.userSessions.get(userId);
        if (!userSessionIds) {
            return 0;
        }
        let terminatedCount = 0;
        for (const sessionId of Array.from(userSessionIds)) {
            if (except && sessionId === except) {
                continue;
            }
            const terminated = await this.terminateSession(sessionId, 'user_sessions_terminated');
            if (terminated) {
                terminatedCount++;
            }
        }
        this.logger.info('User sessions terminated', { userId, terminatedCount });
        return terminatedCount;
    }
    /**
     * Get active sessions for a user
     */
    getUserSessions(userId) {
        const sessionIds = this.userSessions.get(userId);
        if (!sessionIds) {
            return [];
        }
        const sessions = [];
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
    getSessionInfo(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        const { metadata, ...sessionInfo } = session;
        return sessionInfo;
    }
    /**
     * Get all active sessions (admin function)
     */
    getAllActiveSessions() {
        const activeSessions = [];
        for (const session of this.sessions.values()) {
            if (session.isActive && new Date(session.expiresAt) > new Date()) {
                const { metadata, ...sessionInfo } = session;
                activeSessions.push(sessionInfo);
            }
        }
        return activeSessions.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
    }
    /**
     * Update session permissions
     */
    async updateSessionPermissions(sessionId, permissions) {
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
    hasPermission(sessionId, permission) {
        const session = this.sessions.get(sessionId);
        return (session?.isActive && session.permissions.includes(permission)) || false;
    }
    /**
     * Get session statistics
     */
    getSessionStats() {
        const stats = {
            totalSessions: this.sessions.size,
            activeSessions: 0,
            expiredSessions: 0,
            userCount: this.userSessions.size,
            averageSessionDuration: 0,
            sessionsPerUser: {},
        };
        let totalDuration = 0;
        const now = new Date();
        for (const session of this.sessions.values()) {
            if (session.isActive && new Date(session.expiresAt) > now) {
                stats.activeSessions++;
            }
            else {
                stats.expiredSessions++;
            }
            // Calculate session duration
            const created = new Date(session.createdAt);
            const lastActivity = new Date(session.lastActivity);
            const duration = lastActivity.getTime() - created.getTime();
            totalDuration += duration;
            // Count sessions per user
            stats.sessionsPerUser[session.userId] = (stats.sessionsPerUser[session.userId] || 0) + 1;
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
    startCleanupProcess() {
        // Run cleanup every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);
        this.logger.info('Session cleanup process started');
    }
    /**
     * Stop cleanup process
     */
    stopCleanupProcess() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            this.logger.info('Session cleanup process stopped');
        }
    }
    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            const isExpired = new Date(session.expiresAt) < now;
            const isIdle = now.getTime() - new Date(session.lastActivity).getTime() >
                this.config.idleTimeout * 60 * 1000;
            if (isExpired || isIdle) {
                await this.terminateSession(sessionId, isExpired ? 'expired' : 'idle_timeout');
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.logger.info('Expired sessions cleaned up', { cleanedCount });
        }
    }
    /**
     * Generate secure session ID
     */
    generateSessionId() {
        // In production, use crypto.randomBytes for better security
        const uuid = uuidv4();
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `sess_${uuid}_${timestamp}_${random}`.substring(0, this.config.sessionTokenLength || 64);
    }
    /**
     * Log session events for audit
     */
    logSessionEvent(sessionId, eventType, details) {
        const event = {
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
    async shutdown() {
        this.stopCleanupProcess();
        // Terminate all active sessions
        const activeSessions = this.getAllActiveSessions();
        for (const session of activeSessions) {
            await this.terminateSession(session.sessionId, 'system_shutdown');
        }
        this.logger.info('Session manager shutdown complete');
    }
}
/**
 * Factory function to create session manager
 */
export function createSessionManager(config, logger) {
    return new SessionManager(config, logger);
}
/**
 * Default session configuration for healthcare applications
 */
export const defaultSessionConfig = {
    maxDuration: 480, // 8 hours
    idleTimeout: 30, // 30 minutes
    maxConcurrentSessions: 3,
    secureTransport: true,
    sessionTokenLength: 64,
    renewBeforeExpiry: 60, // 1 hour
};
