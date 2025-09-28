/**
 * RTL (Right-to-Left) support utilities for Arabic localization
 */

export interface RTLStyle extends React.CSSProperties {
  direction: 'ltr' | 'rtl';
  textAlign?: 'left' | 'right' | 'center';
}

export const createRTLStyle = (rtl: boolean = false): RTLStyle => ({
  direction: rtl ? 'rtl' : 'ltr',
  textAlign: rtl ? 'right' : 'left',
});

export const rtlAwareMargin = (rtl: boolean, left: string, right: string): React.CSSProperties => ({
  marginLeft: rtl ? right : left,
  marginRight: rtl ? left : right,
});

export const rtlAwarePadding = (rtl: boolean, left: string, right: string): React.CSSProperties => ({
  paddingLeft: rtl ? right : left,
  paddingRight: rtl ? left : right,
});

export const rtlAwarePosition = (rtl: boolean, leftPos?: string, rightPos?: string): React.CSSProperties => {
  if (leftPos && rightPos) {
    return rtl
      ? { right: leftPos, left: rightPos }
      : { left: leftPos, right: rightPos };
  }
  
  if (leftPos) {
    return rtl ? { right: leftPos } : { left: leftPos };
  }
  
  if (rightPos) {
    return rtl ? { left: rightPos } : { right: rightPos };
  }
  
  return {};
};

export const rtlTransform = (rtl: boolean, transform?: string): React.CSSProperties => {
  if (!transform) return {};
  
  return {
    transform: rtl ? `scaleX(-1) ${transform}` : transform,
  };
};

export const arabicFontStack = [
  'Tajawal',
  'Cairo',
  'Amiri',
  'Noto Sans Arabic',
  'Arabic Typesetting',
  'Tahoma',
  'Arial Unicode MS',
  'sans-serif'
].join(', ');

export const createFontStyle = (rtl: boolean): React.CSSProperties => ({
  fontFamily: rtl ? arabicFontStack : 'Inter, system-ui, sans-serif',
  fontFeatureSettings: rtl ? '"liga" 1, "calt" 1, "kern" 1' : '"liga" 1, "calt" 1',
});