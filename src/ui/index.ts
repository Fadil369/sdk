/**
 * UI components and utilities
 */

// Components
export { BaseComponent } from './components/Base';
export { GlassMorphismButton } from './components/GlassMorphismButton';
export { HealthcareDashboard } from './components/HealthcareDashboard';
export { PatientCard } from './components/PatientCard';
export { 
  NotificationSystem, 
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  clearNotifications 
} from './components/NotificationSystem';

// Styles and utilities
export {
  createGlassMorphismStyle,
  darkModeGlassStyle,
  glassMorphismPresets
} from './styles/glassMorphism';

export {
  createRTLStyle,
  rtlAwareMargin,
  rtlAwarePadding,
  rtlAwarePosition,
  rtlTransform,
  arabicFontStack,
  createFontStyle
} from './utils/rtl';

// Hooks
export { useHealthcareTheme } from './hooks/useHealthcareTheme';

// Types - using specific imports to avoid conflicts
export type { BaseComponentProps } from './components/Base';
export type { GlassMorphismButtonProps } from './components/GlassMorphismButton';
export type { HealthcareDashboardProps } from './components/HealthcareDashboard';
export type { PatientCardProps } from './components/PatientCard';
export type { PatientData as UIPatientData } from './components/PatientCard';
export type { NotificationSystemProps, NotificationInstance } from './components/NotificationSystem';
export type { HealthcareTheme, UseHealthcareThemeReturn } from './hooks/useHealthcareTheme';
