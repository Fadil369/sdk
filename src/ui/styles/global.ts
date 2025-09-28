import { breakpointTokens, colorTokens, typographyTokens } from './tokens';

const defaultSans = '"Inter", "Cairo", "Helvetica Neue", Arial, sans-serif';
const defaultDisplay = '"Sora", "Poppins", "Helvetica Neue", Arial, sans-serif';
const defaultPrimary = '#3B82F6';
const defaultPrimaryAccent = '#60A5FA';
const defaultSecondary = '#6366F1';
const defaultSuccess = '#10B981';
const defaultWarning = '#F59E0B';
const defaultDanger = '#EF4444';
const defaultInfo = '#0EA5E9';
const defaultTextPrimary = 'rgba(17, 24, 39, 0.95)';
const defaultTextSecondary = 'rgba(107, 114, 128, 0.85)';

let stylesInjected = false;

const baseStyles = `
:root {
  --brainsait-font-sans: ${defaultSans};
  --brainsait-font-display: ${defaultDisplay};
  --brainsait-color-primary: ${defaultPrimary};
  --brainsait-color-primary-accent: ${defaultPrimaryAccent};
  --brainsait-color-secondary: ${defaultSecondary};
  --brainsait-color-success: ${defaultSuccess};
  --brainsait-color-warning: ${defaultWarning};
  --brainsait-color-danger: ${defaultDanger};
  --brainsait-color-info: ${defaultInfo};
  --brainsait-color-text-primary: ${defaultTextPrimary};
  --brainsait-color-text-secondary: ${defaultTextSecondary};
  --brainsait-radius-sm: 12px;
  --brainsait-radius-md: 16px;
  --brainsait-radius-lg: 24px;
  --brainsait-glass-blur: 24px;
  --brainsait-glass-opacity: 0.14;
  --brainsait-shadow-soft: 0 20px 45px rgba(15, 23, 42, 0.18);
}

@keyframes brainsait-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes brainsait-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes brainsait-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.brainsait-ui-base {
  position: relative;
  color: ${colorTokens.textPrimary};
  font-family: ${typographyTokens.sans};
  line-height: 1.5;
  isolation: isolate;
}

.brainsait-ui-base.glass-morphism::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  backdrop-filter: blur(var(--glass-blur, var(--brainsait-glass-blur)));
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, calc(var(--glass-opacity, var(--brainsait-glass-opacity)) * 0.85)),
    rgba(255, 255, 255, calc(var(--glass-opacity, var(--brainsait-glass-opacity)) * 0.35))
  );
  z-index: -1;
  transition: opacity 240ms ease;
}

.brainsait-ui-base.glass-morphism.glass-dark::before {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, calc(var(--glass-opacity, 0.18) * 1.1)),
    rgba(15, 23, 42, calc(var(--glass-opacity, 0.18) * 0.8))
  );
}

.brainsait-ui-base.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.brainsait-ui-base.loading {
  cursor: progress;
}

.brainsait-ui-base .brainsait-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 1);
  border-radius: 50%;
  animation: brainsait-spin 1s linear infinite;
}

.brainsait-loading-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14px);
  z-index: 20;
}

.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: var(--brainsait-radius-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 200ms ease, box-shadow 240ms ease;
  box-shadow: 0 12px 38px rgba(59, 130, 246, 0.22);
}

.glass-button button {
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  width: 100%;
  height: 100%;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.glass-button:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 50px rgba(59, 130, 246, 0.32);
}

.glass-button:not(.disabled):active {
  transform: translateY(0) scale(0.99);
}

.glass-button .ripple-effect {
  pointer-events: none;
  position: absolute;
  inset: -5%;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.6);
  transition: transform 320ms ease-out, opacity 320ms ease-out;
}

.glass-button:not(.disabled):hover .ripple-effect {
  opacity: 0.6;
  transform: scale(1.25);
}

.healthcare-dashboard {
  backdrop-filter: blur(28px);
  animation: brainsait-fade-in 320ms ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.45));
  box-shadow: var(--brainsait-shadow-soft);
}

.healthcare-dashboard h1 {
  font-family: ${typographyTokens.display};
  letter-spacing: -0.01em;
  color: ${colorTokens.textPrimary};
}

.healthcare-dashboard .dashboard-widget {
  border-radius: var(--brainsait-radius-md);
  backdrop-filter: blur(calc(var(--glass-blur, 24px) * 0.85));
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.35));
  border: 1px solid rgba(255, 255, 255, 0.24);
  transition: transform 200ms ease, box-shadow 240ms ease, border 200ms ease;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.healthcare-dashboard .dashboard-widget:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16);
  border-color: rgba(96, 165, 250, 0.4);
}

.healthcare-dashboard .dashboard-widget .dashboard-widget-metric-value {
  font-size: clamp(1.75rem, 2.2vw, 2.4rem);
}

.patient-card {
  align-items: stretch;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.45));
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: var(--brainsait-radius-md);
  transition: transform 180ms ease, box-shadow 220ms ease;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.patient-card:not(.disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.18);
}

.patient-card h3 {
  font-family: ${typographyTokens.display};
  margin-bottom: 6px;
  color: ${colorTokens.textPrimary};
}

.patient-card .patient-card-details {
  display: grid;
  gap: 0.5rem;
  color: ${colorTokens.textSecondary};
}

.patient-card .patient-card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: ${colorTokens.textSecondary};
}

.patient-card .patient-card-status {
  animation: brainsait-pulse 2.8s infinite;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.55);
}

.notification-system-container {
  position: fixed;
  top: 24px;
  right: 24px;
  display: grid;
  gap: 12px;
  z-index: 9999;
  max-width: min(380px, calc(100vw - 32px));
}

.notification-system-container[data-position='bottom-left'],
.notification-system-container[data-position='bottom-right'] {
  top: auto;
  bottom: 24px;
}

.notification-system-container[data-position='top-left'],
.notification-system-container[data-position='bottom-left'] {
  right: auto;
  left: 24px;
}

.notification-card {
  padding: 16px;
  border-radius: 16px;
  display: grid;
  gap: 8px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78));
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: brainsait-fade-in 280ms ease;
}

.notification-card.success {
  border-left: 6px solid ${colorTokens.success};
}

.notification-card.error {
  border-left: 6px solid ${colorTokens.danger};
}

.notification-card.warning {
  border-left: 6px solid ${colorTokens.warning};
}

.notification-card.info {
  border-left: 6px solid ${colorTokens.info};
}

@media (max-width: ${breakpointTokens.lg}px) {
  .healthcare-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: ${breakpointTokens.md}px) {
  .healthcare-dashboard-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .patient-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}
`;

/**
 * Injects the base CSS needed for the BrainSAIT UI components. Calling this multiple
 * times is safe—the stylesheet will only be appended to the document once.
 */
export const ensureGlobalUIStyles = (): void => {
  if (stylesInjected || typeof document === 'undefined') {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-brainsait-ui-base', 'true');
  style.innerHTML = baseStyles;
  document.head.appendChild(style);
  stylesInjected = true;
};
