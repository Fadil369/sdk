/**
 * Internationalization utilities (placeholder)
 */
export const translations = {
    ar: {
        welcome: 'مرحباً',
        patient: 'مريض',
        doctor: 'طبيب',
    },
    en: {
        welcome: 'Welcome',
        patient: 'Patient',
        doctor: 'Doctor',
    },
};
export const t = (key, locale = 'ar') => {
    return translations[locale][key] || key;
};
//# sourceMappingURL=i18n.js.map