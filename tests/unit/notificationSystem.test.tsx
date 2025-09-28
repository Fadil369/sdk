/**
 * NotificationSystem component tests
 */

import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { NotificationSystem, showNotification, clearNotifications } from '@/ui';

describe('NotificationSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearNotifications();
  });

  afterEach(() => {
    cleanup();
    clearNotifications();
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('dismisses notifications after the configured duration', () => {
    render(
      React.createElement(NotificationSystem, {
        defaultDuration: 800,
        position: 'topRight',
        rtl: false,
        maxNotifications: 3,
      })
    );

    act(() => {
      showNotification({ type: 'info', title: 'Auto dismiss', message: 'payload', duration: 500 });
    });

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();
    expect(screen.getByText('payload')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
  });

  it('animates from the RTL side before becoming visible', () => {
    const { container } = render(
      React.createElement(NotificationSystem, {
        defaultDuration: 1000,
        position: 'topRight',
        rtl: true,
        maxNotifications: 2,
      })
    );

    act(() => {
      showNotification({ type: 'success', title: 'RTL entry', message: 'مرحبا', duration: 0 });
    });

    const notification = container.querySelector<HTMLElement>('.notification');
    expect(notification).toBeTruthy();
    expect(notification?.style.transform).toContain('translateX(-100%)');

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(notification?.style.transform).toContain('translateX(0%)');
  });

  it('limits rendered notifications to the configured maximum', () => {
    const { container } = render(
      React.createElement(NotificationSystem, {
        defaultDuration: 0,
        position: 'topRight',
        rtl: false,
        maxNotifications: 2,
      })
    );

    act(() => {
      showNotification({ type: 'info', title: 'First', message: '1', duration: 0 });
      showNotification({ type: 'warning', title: 'Second', message: '2', duration: 0 });
      showNotification({ type: 'error', title: 'Third', message: '3', duration: 0 });
    });

    act(() => {
      vi.runAllTimers();
    });

    const notifications = container.querySelectorAll('.notification');
    expect(notifications.length).toBe(2);
    expect(container.textContent).toContain('Third');
    expect(container.textContent).toContain('Second');
    expect(container.textContent).not.toContain('First');
  });
});
