/**
 * Base component with glass morphism and RTL support
 */

import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import { ComponentProps, GlassMorphismProps } from '@/types/ui';
import { createGlassMorphismStyle, darkModeGlassStyle } from '../styles/glassMorphism';
import { createRTLStyle, createFontStyle } from '../utils/rtl';
import { ensureGlobalUIStyles } from '../styles/global';

export interface BaseComponentProps extends ComponentProps, GlassMorphismProps {
  theme?: 'light' | 'dark';
  glassMorphism?: boolean;
}

export const BaseComponent = ({
  id,
  className = '',
  style = {},
  children,
  disabled = false,
  loading = false,
  rtl = false,
  theme = 'light',
  glassMorphism = true,
  opacity,
  blur,
  borderRadius,
  border,
  shadow,
  ...props
}: BaseComponentProps): ReactElement => {
  ensureGlobalUIStyles();

  const glassProps = useMemo(
    () => ({ opacity, blur, borderRadius, border, shadow }),
    [opacity, blur, borderRadius, border, shadow]
  );

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    ...(!glassMorphism
      ? {}
      : theme === 'dark'
        ? darkModeGlassStyle(glassProps)
        : createGlassMorphismStyle(glassProps)),
    ...createRTLStyle(rtl),
    ...createFontStyle(rtl),
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    ...(disabled && {
      opacity: 0.6,
      pointerEvents: 'none' as const,
    }),
    ...(loading && {
      cursor: 'progress' as const,
    }),
    ...style,
  };

  const combinedClassName = [
    'brainsait-ui-base',
    glassMorphism && 'glass-morphism',
    theme === 'dark' && 'glass-dark',
    rtl && 'rtl',
    disabled && 'disabled',
    loading && 'loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderedChildren: React.ReactNode[] = [];

  if (loading) {
    renderedChildren.push(
      React.createElement(
        'div',
        { className: 'brainsait-loading-overlay', 'aria-hidden': true },
        React.createElement('div', { className: 'brainsait-spinner' })
      )
    );
  }

  renderedChildren.push(children);

  return React.createElement(
    'div',
    {
      id,
      className: combinedClassName,
      style: baseStyle,
      'aria-busy': loading || undefined,
      'aria-disabled': disabled || undefined,
      'data-theme': theme,
      ...props,
    },
    ...renderedChildren
  );
};
