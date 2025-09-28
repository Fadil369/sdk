/**
 * Glass Morphism Button component
 */

import React, { useMemo } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { BaseComponent, BaseComponentProps } from './Base';
import { colorTokens, transitionTokens } from '../styles/tokens';

export interface GlassMorphismButtonProps extends Omit<BaseComponentProps, 'onClick'> {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
}

const variantStyles: Record<string, CSSProperties> = {
  primary: {
    background: `linear-gradient(135deg, ${colorTokens.primary}, ${colorTokens.secondary})`,
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  secondary: {
    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.85), rgba(75, 85, 99, 0.8))',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  outline: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: colorTokens.primary,
    border: '2px solid rgba(59, 130, 246, 0.75)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
};

const iconDimensions: Record<NonNullable<BaseComponentProps['size']>, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

export const GlassMorphismButton = ({
  type = 'button',
  onClick,
  children,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  animate = true,
  disabled = false,
  loading = false,
  rtl = false,
  ...baseProps
}: GlassMorphismButtonProps): ReactElement => {
  const buttonStyle = useMemo((): CSSProperties => {
    const dimensionStyles: Record<typeof size, CSSProperties> = {
      xs: { padding: '6px 12px', fontSize: '12px', minHeight: '28px' },
      sm: { padding: '8px 16px', fontSize: '14px', minHeight: '32px' },
      md: { padding: '12px 24px', fontSize: '16px', minHeight: '40px' },
      lg: { padding: '16px 32px', fontSize: '18px', minHeight: '48px' },
      xl: { padding: '20px 40px', fontSize: '20px', minHeight: '56px' },
    };

    return {
      ...dimensionStyles[size],
      ...(variantStyles[variant] ?? variantStyles.primary),
      borderRadius: '12px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: 600,
      position: 'relative',
      overflow: 'hidden',
      width: fullWidth ? '100%' : 'auto',
      transition: animate ? transitionTokens.base : 'none',
      backdropFilter: 'blur(20px)',
      ...(disabled && {
        opacity: 0.6,
        pointerEvents: 'none',
      }),
    };
  }, [variant, size, fullWidth, animate, disabled, loading]);

  const iconStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${iconDimensions[size]}px`,
    height: `${iconDimensions[size]}px`,
  };

  const renderContent = (): ReactNode => {
    const iconElement = icon
      ? React.createElement('span', { style: iconStyle, className: 'glass-button-icon' }, icon)
      : null;
    const textElement = children
      ? React.createElement('span', { className: 'glass-button-text' }, children)
      : null;

    if (!icon) {
      return textElement;
    }

    if (!children) {
      return iconElement;
    }

    const isIconLeft = (!rtl && iconPosition === 'left') || (rtl && iconPosition === 'right');

    const nodes = isIconLeft ? [iconElement, textElement] : [textElement, iconElement];
    return React.createElement(React.Fragment, null, ...nodes);
  };

  const childrenNodes: ReactNode[] = [
    React.createElement(
      'button',
      {
        type,
        onClick,
        disabled: disabled || loading,
        style: {
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          cursor: 'inherit',
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        },
        'aria-busy': loading,
        'aria-disabled': disabled,
      },
      renderContent()
    ),
  ];

  if (animate) {
    childrenNodes.push(
      React.createElement('div', {
        key: 'ripple',
        className: 'ripple-effect',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
          transform: 'scale(0)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          transition: 'transform 0.3s ease-out',
        },
      })
    );
  }

  const computedClassName = [
    'glass-button',
    `glass-button-${variant}`,
    `glass-button-${size}`,
    baseProps.className,
  ]
    .filter(Boolean)
    .join(' ');

  const baseComponentProps: BaseComponentProps = {
    ...baseProps,
    style: {
      ...buttonStyle,
      ...baseProps.style,
    },
    disabled,
    loading,
    rtl,
    className: computedClassName,
  };

  return React.createElement(BaseComponent, baseComponentProps, ...childrenNodes);
};
