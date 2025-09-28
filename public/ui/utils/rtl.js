/**
 * RTL (Right-to-Left) support utilities for Arabic localization
 */
export const createRTLStyle = (rtl = false) => ({
    direction: rtl ? 'rtl' : 'ltr',
    textAlign: rtl ? 'right' : 'left',
});
export const rtlAwareMargin = (rtl, left, right) => ({
    marginLeft: rtl ? right : left,
    marginRight: rtl ? left : right,
});
export const rtlAwarePadding = (rtl, left, right) => ({
    paddingLeft: rtl ? right : left,
    paddingRight: rtl ? left : right,
});
export const rtlAwarePosition = (rtl, leftPos, rightPos) => {
    if (leftPos && rightPos) {
        return rtl ? { right: leftPos, left: rightPos } : { left: leftPos, right: rightPos };
    }
    if (leftPos) {
        return rtl ? { right: leftPos } : { left: leftPos };
    }
    if (rightPos) {
        return rtl ? { left: rightPos } : { right: rightPos };
    }
    return {};
};
export const rtlTransform = (rtl, transform) => {
    if (!transform)
        return {};
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
    'sans-serif',
].join(', ');
export const createFontStyle = (rtl) => ({
    fontFamily: rtl ? arabicFontStack : 'Inter, system-ui, sans-serif',
    fontFeatureSettings: rtl ? '"liga" 1, "calt" 1, "kern" 1' : '"liga" 1, "calt" 1',
});
