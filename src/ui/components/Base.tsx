/**
 * Base component with glass morphism and RTL support
 */

import React from 'react';
import { ComponentProps, GlassMorphismProps } from '@/types/ui';
import { createGlassMorphismStyle, darkModeGlassStyle } from '../styles/glassMorphism';
import { createRTLStyle, createFontStyle } from '../utils/rtl';

export interface BaseComponentProps extends ComponentProps, GlassMorphismProps {
  theme?: 'light' | 'dark';
  glassMorphism?: boolean;
}

export const BaseComponent: React.FC<BaseComponentProps> = ({
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
}) => {
  const glassProps = { opacity, blur, borderRadius, border, shadow };
  
  const baseStyle: React.CSSProperties = {
    ...style,
    ...(glassMorphism
      ? theme === 'dark'
        ? darkModeGlassStyle(glassProps)
        : createGlassMorphismStyle(glassProps)
      : {}),
    ...createRTLStyle(rtl),
    ...createFontStyle(rtl),
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    ...(disabled && {
      opacity: 0.6,
      pointerEvents: 'none' as const,
    }),
    ...(loading && {
      cursor: 'wait' as const,
    }),
  };

  const combinedClassName = [
    'brainsait-ui-base',
    glassMorphism && 'glass-morphism',
    rtl && 'rtl',
    disabled && 'disabled',
    loading && 'loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={id}
      className={combinedClassName}
      style={baseStyle}
      {...props}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};