import type { GlassMorphismProps } from '@/types/ui';

/**
 * Design tokens for the BrainSAIT healthcare UI kit. Consumers can override these
 * tokens by setting the matching CSS custom properties before rendering the components.
 */
export const colorTokens = {
  primary: 'var(--brainsait-color-primary, #3B82F6)',
  primaryAccent: 'var(--brainsait-color-primary-accent, #60A5FA)',
  secondary: 'var(--brainsait-color-secondary, #6366F1)',
  success: 'var(--brainsait-color-success, #10B981)',
  warning: 'var(--brainsait-color-warning, #F59E0B)',
  danger: 'var(--brainsait-color-danger, #EF4444)',
  info: 'var(--brainsait-color-info, #0EA5E9)',
  textPrimary: 'var(--brainsait-color-text-primary, rgba(17, 24, 39, 0.95))',
  textSecondary: 'var(--brainsait-color-text-secondary, rgba(107, 114, 128, 0.85))',
  glassLight: 'var(--brainsait-color-glass-light, rgba(255, 255, 255, 0.45))',
  glassDark: 'var(--brainsait-color-glass-dark, rgba(17, 24, 39, 0.45))',
};

export const typographyTokens = {
  sans: 'var(--brainsait-font-sans, "Inter", "Cairo", "Helvetica Neue", Arial, sans-serif)',
  display: 'var(--brainsait-font-display, "Sora", "Poppins", "Helvetica Neue", Arial, sans-serif)',
  monospace: 'var(--brainsait-font-mono, "JetBrains Mono", "Source Code Pro", monospace)',
};

export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const glassTokens: Required<GlassMorphismProps> = {
  opacity: 0.12,
  blur: 20,
  borderRadius: '16px',
  border: true,
  shadow: true,
};

export const transitionTokens = {
  base: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
  microInteraction: 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  fade: 'opacity 240ms ease',
};

export const breakpointTokens = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};
