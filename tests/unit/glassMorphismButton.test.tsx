/**
 * GlassMorphismButton component tests
 */

import React from 'react';
import { describe, it, afterEach, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { GlassMorphismButton } from '@/ui';
import { colorTokens } from '@/ui/styles/tokens';

describe('GlassMorphismButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the primary variant gradient by default', () => {
    const { container } = render(React.createElement(GlassMorphismButton, null, 'Primary CTA'));

    const wrapper = container.querySelector<HTMLElement>('.glass-button');

    expect(wrapper).toBeTruthy();
    expect(wrapper?.style.background).toContain(colorTokens.primary);
    expect(wrapper?.className).toContain('glass-button-primary');
  });

  it('positions the icon according to the requested alignment', () => {
    const icon = React.createElement('span', { 'data-testid': 'icon' }, '★');
    const { container } = render(
      React.createElement(GlassMorphismButton, { icon, iconPosition: 'right' }, 'With Icon')
    );

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    const spans = button?.querySelectorAll('span');
    expect(spans?.length).toBeGreaterThanOrEqual(2);
    expect(spans?.[0]?.classList.contains('glass-button-text')).toBe(true);
    expect(spans?.[1]?.classList.contains('glass-button-icon')).toBe(true);
  });

  it('applies disabled attributes and styling', () => {
    const { container } = render(
      React.createElement(GlassMorphismButton, { disabled: true }, 'Disabled')
    );

    const button = container.querySelector('button');
    const wrapper = container.querySelector<HTMLElement>('.glass-button');

    expect(button).toBeTruthy();
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(wrapper?.style.opacity).toBe('0.6');
    expect(wrapper?.className).toContain('glass-button');
  });
});
