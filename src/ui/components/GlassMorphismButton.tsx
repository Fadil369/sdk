/**
 * Glass Morphism Button component
 */

import React from 'react';
import { BaseComponent, BaseComponentProps } from './Base';

export interface GlassMorphismButtonProps extends Omit<BaseComponentProps, 'onClick'> {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
}

export const GlassMorphismButton: React.FC<GlassMorphismButtonProps> = ({
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
}) => {
  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      xs: { padding: '6px 12px', fontSize: '12px', minHeight: '28px' },
      sm: { padding: '8px 16px', fontSize: '14px', minHeight: '32px' },
      md: { padding: '12px 24px', fontSize: '16px', minHeight: '40px' },
      lg: { padding: '16px 32px', fontSize: '18px', minHeight: '48px' },
      xl: { padding: '20px 40px', fontSize: '20px', minHeight: '56px' },
    };
    return sizes[size];
  };

  const getVariantStyles = (): React.CSSProperties => {
    const variants = {
      primary: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      secondary: {
        background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      outline: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(59, 130, 246, 1)',
        border: '2px solid rgba(59, 130, 246, 0.8)',
      },
      ghost: {
        background: 'transparent',
        color: 'rgba(0, 0, 0, 0.8)',
        border: 'none',
      },
    };
    return variants[variant];
  };

  const buttonStyle: React.CSSProperties = {
    ...getSizeStyles(),
    ...getVariantStyles(),
    borderRadius: '12px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    transition: animate ? 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none',
    backdropFilter: 'blur(20px)',
    ...(animate && !disabled && !loading && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px 0 rgba(59, 130, 246, 0.4)',
      },
      '&:active': {
        transform: 'translateY(0px)',
      },
    }),
    ...(disabled && {
      opacity: 0.6,
      pointerEvents: 'none',
    }),
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(size === 'xs' && { width: '12px', height: '12px' }),
    ...(size === 'sm' && { width: '14px', height: '14px' }),
    ...(size === 'md' && { width: '16px', height: '16px' }),
    ...(size === 'lg' && { width: '18px', height: '18px' }),
    ...(size === 'xl' && { width: '20px', height: '20px' }),
  };

  const renderContent = () => {
    const iconElement = icon && <span style={iconStyle}>{icon}</span>;
    const textElement = children && <span>{children}</span>;

    if (!icon) return textElement;
    if (!children) return iconElement;

    const isIconLeft = (!rtl && iconPosition === 'left') || (rtl && iconPosition === 'right');
    
    return isIconLeft ? (
      <>
        {iconElement}
        {textElement}
      </>
    ) : (
      <>
        {textElement}
        {iconElement}
      </>
    );
  };

  return (
    <BaseComponent
      {...baseProps}
      style={{
        ...buttonStyle,
        ...baseProps.style,
      }}
      disabled={disabled}
      loading={loading}
      rtl={rtl}
      className={`glass-button glass-button-${variant} glass-button-${size} ${baseProps.className || ''}`}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        style={{
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
        }}
      >
        {renderContent()}
      </button>
      
      {/* Ripple effect */}
      {animate && (
        <div
          style={{
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
          }}
          className="ripple-effect"
        />
      )}
    </BaseComponent>
  );
};