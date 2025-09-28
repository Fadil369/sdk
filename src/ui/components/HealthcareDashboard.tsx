/**
 * Healthcare Dashboard component with FHIR integration
 */

import React, { useState, useEffect } from 'react';
import { BaseComponent, BaseComponentProps } from './Base';
import { HealthcareDashboard as DashboardType, DashboardWidget, DashboardFilter } from '@/types/ui';

export interface HealthcareDashboardProps extends BaseComponentProps {
  dashboard: DashboardType;
  onWidgetClick?: (widget: DashboardWidget) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  data?: Record<string, any>;
  refreshInterval?: number;
  isLoading?: boolean;
}

export const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({
  dashboard,
  onWidgetClick,
  onFilterChange,
  data = {},
  refreshInterval,
  isLoading = false,
  rtl = false,
  ...baseProps
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
    // No cleanup needed for the else case
    return undefined;
  }, [refreshInterval]);

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
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

  return (
    <BaseComponent
      {...baseProps}
      style={dashboardStyle}
      rtl={rtl}
      loading={isLoading}
      className={`healthcare-dashboard ${baseProps.className || ''}`}
    >
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{dashboard.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {refreshInterval && (
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  animation: 'pulse 2s infinite',
                }}
              />
              {rtl ? `تحديث كل ${refreshInterval} ثانية` : `Auto-refresh: ${refreshInterval}s`}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {dashboard.filters && dashboard.filters.length > 0 && (
        <div style={filtersStyle}>
          {dashboard.filters.map(filter => (
            <DashboardFilterComponent
              key={filter.id}
              filter={filter}
              value={activeFilters[filter.id]}
              onChange={value => handleFilterChange(filter.id, value)}
              rtl={rtl}
            />
          ))}
        </div>
      )}

      {/* Widgets Grid */}
      <div style={gridStyle}>
        {dashboard.widgets.map(widget => (
          <DashboardWidgetComponent
            key={widget.id}
            widget={widget}
            data={data[widget.id]}
            onClick={() => onWidgetClick?.(widget)}
            rtl={rtl}
            refreshKey={refreshKey}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

// Filter Component
interface DashboardFilterComponentProps {
  filter: DashboardFilter;
  value: any;
  onChange: (value: any) => void;
  rtl: boolean;
}

const DashboardFilterComponent: React.FC<DashboardFilterComponentProps> = ({
  filter,
  value,
  onChange,
  rtl,
}) => {
  const filterStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '14px',
    minWidth: '120px',
  };

  switch (filter.type) {
    case 'select':
      return (
        <select value={value || ''} onChange={e => onChange(e.target.value)} style={filterStyle}>
          <option value="">{filter.placeholder}</option>
          {filter.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={filter.placeholder}
          style={filterStyle}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={filter.placeholder}
          style={filterStyle}
        />
      );
  }
};

// Widget Component
interface DashboardWidgetComponentProps {
  widget: DashboardWidget;
  data?: any;
  onClick?: () => void;
  rtl: boolean;
  refreshKey: number;
}

const DashboardWidgetComponent: React.FC<DashboardWidgetComponentProps> = ({
  widget,
  data,
  onClick,
  rtl,
}) => {
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
    minHeight: widget.minHeight || '200px',
    ...(onClick && {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.4)',
      },
    }),
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
    color: widget.color || '#3B82F6',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.6)',
  };

  return (
    <div
      style={widgetStyle}
      onClick={onClick}
      className={`dashboard-widget dashboard-widget-${widget.type}`}
    >
      <h3 style={titleStyle}>{widget.title}</h3>

      {widget.type === 'metric' && data && (
        <>
          <div style={valueStyle}>{data.value || '---'}</div>
          <div style={subtitleStyle}>{data.subtitle || widget.subtitle}</div>
        </>
      )}

      {widget.type === 'chart' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={subtitleStyle}>{rtl ? 'الرسم البياني' : 'Chart visualization'}</div>
        </div>
      )}

      {widget.type === 'list' && data?.items && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {data.items.slice(0, 5).map((item: any, index: number) => (
            <div
              key={index}
              style={{
                padding: '8px 0',
                borderBottom:
                  index < data.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                fontSize: '14px',
              }}
            >
              {item.label || item.name || item.toString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
