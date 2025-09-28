/**
 * UI and component type definitions
 */

import * as React from 'react';

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  glassMorphism: {
    enabled: boolean;
    opacity: number;
    blur: number;
  };
  performance: {
    targetFps: number;
    lazyLoading: boolean;
    virtualScrolling: boolean;
  };
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  glassMorphism: {
    background: string;
    backdrop: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
}

export interface ComponentProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rtl?: boolean;
}

export interface GlassMorphismProps {
  opacity?: number;
  blur?: number;
  borderRadius?: string;
  border?: boolean;
  shadow?: boolean;
}

export interface HealthcareDashboard {
  id: string;
  title: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters?: DashboardFilter[];
  refreshInterval?: number;
  permissions: string[];
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gaps: string;
  responsive: {
    breakpoint: string;
    columns: number;
  }[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'list' | 'form' | 'map';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dataSource: string;
  configuration: Record<string, unknown>;
  refreshInterval?: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number';
  options?: FilterOption[];
  value?: unknown;
  required?: boolean;
}

export interface FilterOption {
  label: string;
  value: unknown;
  icon?: string;
}

export interface FormField {
  name: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'checkbox'
    | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: FieldValidation;
  options?: FilterOption[];
  disabled?: boolean;
  rtl?: boolean;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  custom?: (value: unknown) => string | null;
}

export interface DataTable {
  columns: TableColumn[];
  data: unknown[];
  pagination?: TablePagination;
  sorting?: TableSorting;
  filtering?: TableFiltering;
  selection?: TableSelection;
  loading?: boolean;
  rtl?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: unknown) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
}

export interface TableSorting {
  column?: string;
  direction?: 'asc' | 'desc';
  multiple?: boolean;
}

export interface TableFiltering {
  filters: Record<string, unknown>;
  searchText?: string;
  searchColumns?: string[];
}

export interface TableSelection {
  type: 'single' | 'multiple';
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
  rtl?: boolean;
}
