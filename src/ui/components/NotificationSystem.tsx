/**
 * Notification System with RTL support
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import { BaseComponentProps } from './Base';
import { NotificationConfig } from '@/types/ui';

export interface NotificationSystemProps extends BaseComponentProps {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
}

export interface NotificationInstance extends NotificationConfig {
  id: string;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'system' | 'security' | 'patient' | 'workflow' | 'compliance';
  acknowledged?: boolean;
  readAt?: number;
  metadata?: Record<string, unknown>;
}

let notificationId = 0;
const globalNotifications: NotificationInstance[] = [];
const subscribers: Array<(notifications: NotificationInstance[]) => void> = [];

export const NotificationSystem = ({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'topRight',
  rtl = false,
  ...baseProps
}: NotificationSystemProps): ReactElement => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>([]);

  useEffect(() => {
    const updateNotifications = (newNotifications: NotificationInstance[]) => {
      setNotifications([...newNotifications]);
    };

    subscribers.push(updateNotifications);
    updateNotifications(globalNotifications);

    return () => {
      const index = subscribers.indexOf(updateNotifications);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const removeNotification = useCallback((id: string) => {
    const index = globalNotifications.findIndex(notification => notification.id === id);
    if (index > -1) {
      globalNotifications.splice(index, 1);
      subscribers.forEach(subscriber => subscriber(globalNotifications));
    }
  }, []);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const duration = notification.duration ?? defaultDuration;
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, defaultDuration, removeNotification]);

  const getPositionStyles = (): CSSProperties => {
    const positions: Record<Required<NotificationSystemProps>['position'], CSSProperties> = {
      topLeft: { top: '20px', left: '20px' },
      topRight: { top: '20px', right: '20px' },
      bottomLeft: { bottom: '20px', left: '20px' },
      bottomRight: { bottom: '20px', right: '20px' },
      top: { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      bottom: { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
    };

    return positions[position ?? 'topRight'];
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    ...getPositionStyles(),
    zIndex: 9999,
    display: 'flex',
    flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
    gap: '12px',
    maxWidth: '400px',
    width: 'auto',
    pointerEvents: 'none',
    ...baseProps.style,
  };

  const combinedClassName = ['notification-system', baseProps.className].filter(Boolean).join(' ');

  const visibleNotifications = notifications.slice(0, maxNotifications);

  return React.createElement(
    'div',
    {
      className: combinedClassName,
      style: containerStyle,
    },
    ...visibleNotifications.map(notification =>
      React.createElement(NotificationCard, {
        key: notification.id,
        notification,
        onClose: () => removeNotification(notification.id),
        rtl,
      })
    )
  );
};

interface NotificationCardProps {
  notification: NotificationInstance;
  onClose: () => void;
  rtl: boolean;
}

const NotificationCard = ({
  notification,
  onClose,
  rtl = false,
}: NotificationCardProps): ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const typeStyles = getTypeStyles(notification.type);
  const cardStyle: CSSProperties = {
    ...typeStyles,
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid',
    backdropFilter: 'blur(20px)',
    color: 'white',
    minWidth: '300px',
    maxWidth: '400px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    pointerEvents: 'auto',
    cursor: 'default',
    transform: `translateX(${
      isExiting ? (rtl ? '-100%' : '100%') : isVisible ? '0%' : rtl ? '-100%' : '100%'
    }) translateY(${isExiting ? '-10px' : '0px'})`,
    opacity: isExiting ? 0 : isVisible ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: notification.message ? '8px' : '0',
  };

  const titleStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const messageStyle: CSSProperties = {
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: '1.4',
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  };

  const handleMouseEnter = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  };

  const handleMouseLeave = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };

  const cardChildren: ReactNode[] = [];

  const headerContent = React.createElement(
    'div',
    { style: headerStyle },
    React.createElement(
      'h4',
      { style: titleStyle },
      React.createElement('span', null, getTypeIcon(notification.type)),
      notification.title
    ),
    React.createElement(
      'button',
      {
        onClick: handleClose,
        style: closeButtonStyle,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      },
      '×'
    )
  );

  cardChildren.push(headerContent);

  if (notification.message) {
    cardChildren.push(
      React.createElement('p', { key: 'message', style: messageStyle }, notification.message)
    );
  }

  return React.createElement(
    'div',
    { style: cardStyle, className: `notification notification-${notification.type}` },
    ...cardChildren
  );
};

// Global notification functions
export const showNotification = (config: Omit<NotificationConfig, 'id'>): string => {
  const notification: NotificationInstance = {
    ...config,
    id: `notification-${++notificationId}`,
    timestamp: Date.now(),
  };

  globalNotifications.unshift(notification);
  subscribers.forEach(sub => sub(globalNotifications));

  return notification.id;
};

export const showSuccess = (title: string, message?: string, duration?: number): string =>
  showNotification({ type: 'success', title, message, duration });

export const showError = (title: string, message?: string, duration?: number): string =>
  showNotification({ type: 'error', title, message, duration });

export const showWarning = (title: string, message?: string, duration?: number): string =>
  showNotification({ type: 'warning', title, message, duration });

export const showInfo = (title: string, message?: string, duration?: number): string =>
  showNotification({ type: 'info', title, message, duration });

export const clearNotifications = (): void => {
  globalNotifications.length = 0;
  subscribers.forEach(sub => sub(globalNotifications));
};

const getTypeStyles = (type: NotificationConfig['type']): CSSProperties => {
  const styles: Record<'success' | 'error' | 'warning' | 'info', CSSProperties> = {
    success: {
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9))',
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    error: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9))',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.9))',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
  };

  if (type && type in styles) {
    return styles[type as keyof typeof styles];
  }

  return styles.info;
};

const getTypeIcon = (type: NotificationConfig['type']): string => {
  const icons: Record<'success' | 'error' | 'warning' | 'info', string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  if (type && type in icons) {
    return icons[type as keyof typeof icons];
  }

  return icons.info;
};

/**
 * Enhanced Healthcare Notification Manager
 */
export class HealthcareNotificationManager {
  private static instance: HealthcareNotificationManager;
  private analytics: Map<string, { count: number; lastSeen: number }> = new Map();

  static getInstance(): HealthcareNotificationManager {
    if (!HealthcareNotificationManager.instance) {
      HealthcareNotificationManager.instance = new HealthcareNotificationManager();
    }
    return HealthcareNotificationManager.instance;
  }

  /**
   * Show enhanced notification with healthcare context
   */
  showHealthcareNotification(config: NotificationConfig & {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'system' | 'security' | 'patient' | 'workflow' | 'compliance';
    patientId?: string;
    userId?: string;
    requiresAcknowledgment?: boolean;
    metadata?: Record<string, unknown>;
  }): string {
    const { priority, category, patientId, userId, requiresAcknowledgment, ...notificationConfig } = config;
    
    const id = showNotification({
      ...notificationConfig,
      metadata: {
        ...config.metadata,
        priority: priority || 'medium',
        category: category || 'system',
        patientId,
        userId,
        requiresAcknowledgment,
      },
    });

    // Track analytics
    const key = `${config.category || 'system'}-${config.type}`;
    const existing = this.analytics.get(key) || { count: 0, lastSeen: 0 };
    this.analytics.set(key, {
      count: existing.count + 1,
      lastSeen: Date.now(),
    });

    return id;
  }

  /**
   * Show critical security alert
   */
  showSecurityAlert(message: string, details?: Record<string, unknown>): string {
    return this.showHealthcareNotification({
      type: 'error',
      title: '🔒 Security Alert',
      message,
      priority: 'critical',
      category: 'security',
      duration: 0, // Don't auto-dismiss critical security alerts
      requiresAcknowledgment: true,
      metadata: details,
    });
  }

  /**
   * Show compliance violation warning
   */
  showComplianceWarning(violation: string, recommendation?: string): string {
    return this.showHealthcareNotification({
      type: 'warning',
      title: '⚖️ Compliance Warning',
      message: `${violation}${recommendation ? `\n\nRecommendation: ${recommendation}` : ''}`,
      priority: 'high',
      category: 'compliance',
      duration: 10000,
      requiresAcknowledgment: true,
    });
  }

  /**
   * Show patient update notification
   */
  showPatientUpdate(patientId: string, updateType: string, message: string): string {
    return this.showHealthcareNotification({
      type: 'info',
      title: '👤 Patient Update',
      message: `${updateType}: ${message}`,
      priority: 'medium',
      category: 'patient',
      patientId,
      duration: 7000,
    });
  }

  /**
   * Show workflow status notification
   */
  showWorkflowStatus(
    workflowName: string, 
    status: 'started' | 'completed' | 'failed' | 'paused',
    details?: string
  ): string {
    const icons = { started: '▶️', completed: '✅', failed: '❌', paused: '⏸️' };
    const types = { started: 'info', completed: 'success', failed: 'error', paused: 'warning' } as const;
    
    return this.showHealthcareNotification({
      type: types[status],
      title: `${icons[status]} Workflow ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `${workflowName}${details ? `: ${details}` : ''}`,
      priority: status === 'failed' ? 'high' : 'medium',
      category: 'workflow',
      duration: status === 'completed' ? 5000 : 8000,
    });
  }

  /**
   * Acknowledge notification
   */
  acknowledgeNotification(id: string): void {
    const index = globalNotifications.findIndex(n => n.id === id);
    if (index > -1 && globalNotifications[index]) {
      globalNotifications[index].acknowledged = true;
      globalNotifications[index].readAt = Date.now();
      // Notify subscribers
      subscribers.forEach(callback => callback(globalNotifications));
    }
  }

  /**
   * Get unacknowledged critical notifications
   */
  getCriticalNotifications(): NotificationInstance[] {
    return globalNotifications.filter(
      n => n.priority === 'critical' && !n.acknowledged
    );
  }

  /**
   * Get notifications by category
   */
  getNotificationsByCategory(category: string): NotificationInstance[] {
    return globalNotifications.filter(n => n.category === category);
  }

  /**
   * Get notification analytics
   */
  getAnalytics(): Record<string, { count: number; lastSeen: number }> {
    const result: Record<string, { count: number; lastSeen: number }> = {};
    for (const [key, value] of this.analytics.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removedCount = 0;
    
    for (let i = globalNotifications.length - 1; i >= 0; i--) {
      const notification = globalNotifications[i];
      if (notification && notification.timestamp < cutoff && notification.acknowledged) {
        globalNotifications.splice(i, 1);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      subscribers.forEach(callback => callback(globalNotifications));
    }
    
    return removedCount;
  }

  /**
   * Generate notification summary report
   */
  generateSummaryReport(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    unacknowledged: number;
    oldestUnacknowledged?: number;
  } {
    const report = {
      total: globalNotifications.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      unacknowledged: 0,
      oldestUnacknowledged: undefined as number | undefined,
    };

    for (const notification of globalNotifications) {
      // Count by type
      report.byType[notification.type || 'info'] = (report.byType[notification.type || 'info'] || 0) + 1;
      
      // Count by category
      const category = notification.category || 'system';
      report.byCategory[category] = (report.byCategory[category] || 0) + 1;
      
      // Count by priority
      const priority = notification.priority || 'medium';
      report.byPriority[priority] = (report.byPriority[priority] || 0) + 1;
      
      // Track unacknowledged
      if (!notification.acknowledged) {
        report.unacknowledged++;
        if (!report.oldestUnacknowledged || notification.timestamp < report.oldestUnacknowledged) {
          report.oldestUnacknowledged = notification.timestamp;
        }
      }
    }

    return report;
  }
}

/**
 * Global healthcare notification manager instance
 */
export const healthcareNotificationManager = HealthcareNotificationManager.getInstance();
