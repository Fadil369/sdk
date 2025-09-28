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

export const t = (key: string, locale: 'ar' | 'en' = 'ar'): string => {
  return translations[locale][key as keyof typeof translations.ar] || key;
};