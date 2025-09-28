/**
 * Glass Morphism styling utilities
 */
export const createGlassMorphismStyle = (props = {}) => {
    const { opacity = 0.1, blur = 20, borderRadius = '12px', border = true, shadow = true } = props;
    return {
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius,
        boxShadow: shadow ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none',
    };
};
export const glassMorphismPresets = {
    card: {
        opacity: 0.1,
        blur: 20,
        borderRadius: '16px',
        border: true,
        shadow: true,
    },
    button: {
        opacity: 0.15,
        blur: 10,
        borderRadius: '8px',
        border: true,
        shadow: false,
    },
    modal: {
        opacity: 0.08,
        blur: 30,
        borderRadius: '20px',
        border: true,
        shadow: true,
    },
    navbar: {
        opacity: 0.12,
        blur: 15,
        borderRadius: '0px',
        border: false,
        shadow: true,
    },
};
export const darkModeGlassStyle = (props = {}) => {
    const { opacity = 0.1, blur = 20, borderRadius = '12px', border = true, shadow = true } = props;
    return {
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(0, 0, 0, ${opacity + 0.2})`,
        border: border ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        borderRadius,
        boxShadow: shadow ? '0 8px 32px 0 rgba(0, 0, 0, 0.5)' : 'none',
    };
};
