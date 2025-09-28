/**
 * Notification System with RTL support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BaseComponent, BaseComponentProps } from './Base';
import { NotificationConfig } from '@/types/ui';

export interface NotificationSystemProps extends BaseComponentProps {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
}

export interface NotificationInstance extends NotificationConfig {
  id: string;
  timestamp: number;
}

let notificationId = 0;
const globalNotifications: NotificationInstance[] = [];
const subscribers: ((notifications: NotificationInstance[]) => void)[] = [];

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'topRight',
  rtl = false,
  ...baseProps
}) => {
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
    const index = globalNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      globalNotifications.splice(index, 1);
      subscribers.forEach(sub => sub(globalNotifications));
    }
  }, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const duration = notification.duration || defaultDuration;
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

  const getPositionStyles = (): React.CSSProperties => {
    const positions = {
      topLeft: { top: '20px', left: '20px' },
      topRight: { top: '20px', right: '20px' },
      bottomLeft: { bottom: '20px', left: '20px' },
      bottomRight: { bottom: '20px', right: '20px' },
      top: { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      bottom: { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
    };
    return positions[position];
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    ...getPositionStyles(),
    zIndex: 9999,
    display: 'flex',
    flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
    gap: '12px',
    maxWidth: '400px',
    width: 'auto',
    pointerEvents: 'none',
  };

  const visibleNotifications = notifications.slice(0, maxNotifications);

  return (
    <div style={containerStyle} className="notification-system">
      {visibleNotifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          rtl={rtl}
        />
      ))}
    </div>
  );
};

// Notification Card Component
interface NotificationCardProps {
  notification: NotificationInstance;
  onClose: () => void;
  rtl: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClose,
  rtl = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const getTypeStyles = () => {
    const styles = {
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
    return styles[notification.type] || styles.info;
  };

  const getTypeIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[notification.type] || icons.info;
  };

  const cardStyle: React.CSSProperties = {
    ...getTypeStyles(),
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

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: notification.message ? '8px' : '0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: '1.4',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
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

  return (
    <div style={cardStyle} className={`notification notification-${notification.type}`}>
      <div style={headerStyle}>
        <h4 style={titleStyle}>
          <span>{getTypeIcon()}</span>
          {notification.title}
        </h4>
        <button
          onClick={handleClose}
          style={closeButtonStyle}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ×
        </button>
      </div>
      {notification.message && <p style={messageStyle}>{notification.message}</p>}
    </div>
  );
};

// Global notification functions
export const showNotification = (config: Omit<NotificationConfig, 'id'>) => {
  const notification: NotificationInstance = {
    ...config,
    id: `notification-${++notificationId}`,
    timestamp: Date.now(),
  };

  globalNotifications.unshift(notification);
  subscribers.forEach(sub => sub(globalNotifications));

  return notification.id;
};

export const showSuccess = (title: string, message?: string, duration?: number) =>
  showNotification({ type: 'success', title, message, duration });

export const showError = (title: string, message?: string, duration?: number) =>
  showNotification({ type: 'error', title, message, duration });

export const showWarning = (title: string, message?: string, duration?: number) =>
  showNotification({ type: 'warning', title, message, duration });

export const showInfo = (title: string, message?: string, duration?: number) =>
  showNotification({ type: 'info', title, message, duration });

export const clearNotifications = () => {
  globalNotifications.length = 0;
  subscribers.forEach(sub => sub(globalNotifications));
};
