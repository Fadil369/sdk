/**
 * Healthcare Dashboard component with FHIR integration
 */

import React, { useState, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { BaseComponent, BaseComponentProps } from './Base';
import { HealthcareDashboard as DashboardType, DashboardWidget, DashboardFilter } from '@/types/ui';

const resolveListItemContent = (item: unknown): ReactNode => {
  if (typeof item === 'object' && item !== null) {
    const objectItem = item as { label?: ReactNode; name?: ReactNode };
    return objectItem.label ?? objectItem.name ?? String(item);
  }

  return String(item);
};

export interface HealthcareDashboardProps extends BaseComponentProps {
  dashboard: DashboardType;
  onWidgetClick?: (widget: DashboardWidget) => void;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  data?: Record<string, unknown>;
  refreshInterval?: number;
  isLoading?: boolean;
}

export const HealthcareDashboard = ({
  dashboard,
  onWidgetClick,
  onFilterChange,
  data = {},
  refreshInterval,
  isLoading = false,
  rtl = false,
  ...baseProps
}: HealthcareDashboardProps): ReactElement => {
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Enhanced refresh functionality
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !isAutoRefresh) {
      return undefined;
    }

    const interval = setInterval(() => {
      setRefreshTick(prev => prev + 1);
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, isAutoRefresh]);

  // Handle filter changes with analytics
  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    setRefreshTick(prev => prev + 1);
    setLastRefresh(new Date());
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefresh(prev => !prev);
  };

  // Format last refresh time
  const formatLastRefresh = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const dashboardStyle: React.CSSProperties = {
    padding: '24px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.9)',
    margin: 0,
  };

  const filtersStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${dashboard.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${dashboard.layout.rows}, minmax(200px, auto))`,
    gap: dashboard.layout.gaps,
    flex: 1,
  };

  const refreshInfo = refreshInterval
    ? React.createElement(
        'div',
        {
          style: {
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          },
        },
        React.createElement('div', {
          style: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            animation: 'pulse 2s infinite',
          },
        }),
        rtl ? `تحديث كل ${refreshInterval} ثانية` : `Auto-refresh: ${refreshInterval}s`
      )
    : null;

  const header = React.createElement(
    'div',
    { style: headerStyle },
    React.createElement('h1', { style: titleStyle }, dashboard.title),
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
      refreshInfo
    )
  );

  const filtersNode =
    dashboard.filters && dashboard.filters.length > 0
      ? React.createElement(
          'div',
          { style: filtersStyle },
          ...dashboard.filters.map(filter =>
            React.createElement(DashboardFilterComponent, {
              key: filter.id,
              filter,
              value: activeFilters[filter.id],
              onChange: value => handleFilterChange(filter.id, value),
              rtl,
            })
          )
        )
      : null;

  const widgets = React.createElement(
    'div',
    { style: gridStyle },
    ...dashboard.widgets.map(widget =>
      React.createElement(DashboardWidgetComponent, {
        key: widget.id,
        widget,
        data: data[widget.id],
        onClick: () => onWidgetClick?.(widget),
        rtl,
      })
    )
  );

  const className = ['healthcare-dashboard', baseProps.className].filter(Boolean).join(' ');

  const baseChildren: ReactNode[] = [header];
  if (filtersNode) {
    baseChildren.push(filtersNode);
  }
  baseChildren.push(widgets);

  return React.createElement(
    BaseComponent,
    {
      ...baseProps,
      style: {
        ...dashboardStyle,
        ...baseProps.style,
      },
      rtl,
      loading: isLoading,
      className,
    },
    ...baseChildren
  );
};

interface DashboardFilterComponentProps {
  filter: DashboardFilter;
  value: unknown;
  onChange: (value: unknown) => void;
  rtl: boolean;
}

const DashboardFilterComponent = ({
  filter,
  value,
  onChange,
}: DashboardFilterComponentProps): ReactElement => {
  const filterStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '14px',
    minWidth: '120px',
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  if (filter.type === 'select') {
    const options = [
      React.createElement('option', { key: 'placeholder', value: '' }, filter.placeholder ?? ''),
      ...(filter.options?.map(option =>
        React.createElement('option', { key: option.value, value: option.value }, option.label)
      ) ?? []),
    ];

    return React.createElement(
      'select',
      {
        value: (value as string) ?? '',
        onChange: handleSelectChange,
        style: filterStyle,
      },
      ...options
    );
  }

  const inputProps = {
    value: (value as string) ?? '',
    onChange: handleInputChange,
    placeholder: filter.placeholder,
    style: filterStyle,
  };

  const inputType = filter.type === 'date' ? 'date' : 'text';

  return React.createElement('input', { ...inputProps, type: inputType });
};

interface DashboardWidgetComponentProps {
  widget: DashboardWidget;
  data?: unknown;
  onClick?: () => void;
  rtl: boolean;
}

const DashboardWidgetComponent = ({
  widget,
  data,
  onClick,
  rtl,
}: DashboardWidgetComponentProps): ReactElement => {
  const widgetStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: widget.minHeight ?? '200px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: '16px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: widget.color ?? '#3B82F6',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.6)',
  };

  const metricNodes: ReactNode[] = [];
  if (widget.type === 'metric' && data && typeof data === 'object' && data !== null) {
    const metricData = data as { value?: ReactNode; subtitle?: ReactNode };
    metricNodes.push(
      React.createElement('div', { key: 'value', style: valueStyle }, metricData.value ?? '---')
    );
    metricNodes.push(
      React.createElement(
        'div',
        { key: 'subtitle', style: subtitleStyle },
        metricData.subtitle ?? widget.subtitle
      )
    );
  }

  let body: ReactNode = null;

  if (widget.type === 'metric') {
    body = React.createElement(React.Fragment, null, ...metricNodes);
  } else if (widget.type === 'chart') {
    body = React.createElement(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      React.createElement(
        'div',
        { style: subtitleStyle },
        rtl ? 'الرسم البياني' : 'Chart visualization'
      )
    );
  } else if (widget.type === 'list' && data && typeof data === 'object' && data !== null) {
    const items = (data as { items?: Array<unknown> }).items ?? [];
    body = React.createElement(
      'div',
      { style: { flex: 1, overflow: 'auto' } },
      ...items.slice(0, 5).map((item, index) =>
        React.createElement(
          'div',
          {
            key: index,
            style: {
              padding: '8px 0',
              borderBottom:
                index < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              fontSize: '14px',
            },
          },
          resolveListItemContent(item)
        )
      )
    );
  }

  const cardChildren: ReactNode[] = [
    React.createElement('h3', { key: 'title', style: titleStyle }, widget.title),
  ];
  if (body) {
    cardChildren.push(body);
  }

  const handleKeyDown = onClick
    ? (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }
    : undefined;

  return React.createElement(
    'div',
    {
      style: widgetStyle,
      onClick,
      className: `dashboard-widget dashboard-widget-${widget.type}`,
      role: onClick ? 'button' : undefined,
      tabIndex: onClick ? 0 : undefined,
      onKeyDown: handleKeyDown,
    },
    ...cardChildren
  );
};
