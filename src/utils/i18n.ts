/**
 * Enhanced internationalization utilities with comprehensive Arabic support
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface I18nConfig {
  defaultLanguage: 'ar' | 'en';
  fallbackLanguage: 'ar' | 'en';
  rtl: boolean;
  enablePluralRules: boolean;
  enableDateFormatting: boolean;
  enableNumberFormatting: boolean;
}

export interface TranslationData {
  [key: string]: string | TranslationData | PluralTranslation;
}

export interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  calendar?: 'gregorian' | 'islamic';
}

export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useArabicNumerals?: boolean;
}

/**
 * Enhanced translations with Arabic medical terminology
 */
export const translations = {
  ar: {
    // Common terms
    welcome: 'مرحباً',
    patient: 'مريض',
    doctor: 'طبيب',
    nurse: 'ممرضة',
    hospital: 'مستشفى',
    clinic: 'عيادة',
    appointment: 'موعد',
    
    // Medical terms
    diagnosis: 'تشخيص',
    treatment: 'علاج',
    medication: 'دواء',
    prescription: 'وصفة طبية',
    symptom: 'عرض',
    allergy: 'حساسية',
    condition: 'حالة',
    procedure: 'إجراء',
    surgery: 'جراحة',
    
    // FHIR Resources
    'fhir.patient': 'مريض',
    'fhir.practitioner': 'ممارس',
    'fhir.organization': 'مؤسسة',
    'fhir.encounter': 'مواجهة',
    'fhir.observation': 'ملاحظة',
    'fhir.condition': 'حالة',
    'fhir.medication': 'دواء',
    'fhir.procedure': 'إجراء',
    
    // NPHIES specific
    'nphies.claim': 'مطالبة',
    'nphies.eligibility': 'أهلية',
    'nphies.preauth': 'تفويض مسبق',
    'nphies.submission': 'تقديم',
    'nphies.response': 'رد',
    
    // Status messages
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'status.pending': 'معلق',
    'status.completed': 'مكتمل',
    'status.cancelled': 'ملغي',
    'status.draft': 'مسودة',
    
    // Error messages
    'error.network': 'خطأ في الشبكة',
    'error.authentication': 'خطأ في المصادقة',
    'error.validation': 'خطأ في التحقق',
    'error.permission': 'خطأ في الصلاحية',
    'error.notFound': 'غير موجود',
    'error.serverError': 'خطأ في الخادم',
    
    // Success messages
    'success.saved': 'تم الحفظ بنجاح',
    'success.deleted': 'تم الحذف بنجاح',
    'success.updated': 'تم التحديث بنجاح',
    'success.created': 'تم الإنشاء بنجاح',
    
    // Actions
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.delete': 'حذف',
    'action.edit': 'تعديل',
    'action.add': 'إضافة',
    'action.search': 'بحث',
    'action.submit': 'إرسال',
    
    // Plurals for Arabic
    plurals: {
      patient: {
        zero: 'لا يوجد مرضى',
        one: 'مريض واحد',
        two: 'مريضان',
        few: '{count} مرضى',
        many: '{count} مريض',
        other: '{count} مريض'
      },
      appointment: {
        zero: 'لا توجد مواعيد',
        one: 'موعد واحد',
        two: 'موعدان',
        few: '{count} مواعيد',
        many: '{count} موعد',
        other: '{count} موعد'
      }
    }
  },
  en: {
    // Common terms
    welcome: 'Welcome',
    patient: 'Patient',
    doctor: 'Doctor',
    nurse: 'Nurse',
    hospital: 'Hospital',
    clinic: 'Clinic',
    appointment: 'Appointment',
    
    // Medical terms
    diagnosis: 'Diagnosis',
    treatment: 'Treatment',
    medication: 'Medication',
    prescription: 'Prescription',
    symptom: 'Symptom',
    allergy: 'Allergy',
    condition: 'Condition',
    procedure: 'Procedure',
    surgery: 'Surgery',
    
    // FHIR Resources
    'fhir.patient': 'Patient',
    'fhir.practitioner': 'Practitioner',
    'fhir.organization': 'Organization',
    'fhir.encounter': 'Encounter',
    'fhir.observation': 'Observation',
    'fhir.condition': 'Condition',
    'fhir.medication': 'Medication',
    'fhir.procedure': 'Procedure',
    
    // NPHIES specific
    'nphies.claim': 'Claim',
    'nphies.eligibility': 'Eligibility',
    'nphies.preauth': 'Pre-authorization',
    'nphies.submission': 'Submission',
    'nphies.response': 'Response',
    
    // Status messages
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.draft': 'Draft',
    
    // Error messages
    'error.network': 'Network Error',
    'error.authentication': 'Authentication Error',
    'error.validation': 'Validation Error',
    'error.permission': 'Permission Error',
    'error.notFound': 'Not Found',
    'error.serverError': 'Server Error',
    
    // Success messages
    'success.saved': 'Successfully Saved',
    'success.deleted': 'Successfully Deleted',
    'success.updated': 'Successfully Updated',
    'success.created': 'Successfully Created',
    
    // Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.add': 'Add',
    'action.search': 'Search',
    'action.submit': 'Submit',
    
    // Plurals for English
    plurals: {
      patient: {
        one: '1 patient',
        other: '{count} patients'
      },
      appointment: {
        one: '1 appointment',
        other: '{count} appointments'
      }
    }
  }
};

/**
 * Enhanced internationalization class
 */
export class I18nManager {
  private config: I18nConfig;
  private currentLanguage: 'ar' | 'en';
  private translations: typeof translations;
  private arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = {
      defaultLanguage: 'ar',
      fallbackLanguage: 'en',
      rtl: true,
      enablePluralRules: true,
      enableDateFormatting: true,
      enableNumberFormatting: true,
      ...config
    };
    
    this.currentLanguage = this.config.defaultLanguage;
    this.translations = translations;
  }

  /**
   * Set current language
   */
  setLanguage(language: 'ar' | 'en'): void {
    this.currentLanguage = language;
  }

  /**
   * Get current language
   */
  getLanguage(): 'ar' | 'en' {
    return this.currentLanguage;
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    return this.currentLanguage === 'ar' && this.config.rtl;
  }

  /**
   * Translate a key with interpolation
   */
  t(key: string, params?: Record<string, any>, locale?: 'ar' | 'en'): string {
    const lang = locale || this.currentLanguage;
    const langTranslations = this.translations[lang];
    
    // Get translation value
    const translation = this.getNestedValue(langTranslations, key);
    
    if (translation && typeof translation === 'string') {
      return this.interpolate(translation, params);
    }

    // Fallback to other language
    const fallbackLang = lang === 'ar' ? 'en' : 'ar';
    const fallbackTranslation = this.getNestedValue(this.translations[fallbackLang], key);
    
    if (fallbackTranslation && typeof fallbackTranslation === 'string') {
      return this.interpolate(fallbackTranslation, params);
    }

    // Return key if no translation found
    return key;
  }

  /**
   * Translate with plural rules
   */
  tPlural(key: string, count: number, params?: Record<string, any>, locale?: 'ar' | 'en'): string {
    if (!this.config.enablePluralRules) {
      return this.t(key, { ...params, count }, locale);
    }

    const lang = locale || this.currentLanguage;
    const pluralKey = `plurals.${key}`;
    const pluralTranslations = this.getNestedValue(this.translations[lang], pluralKey) as PluralTranslation;

    if (pluralTranslations) {
      const pluralForm = this.getPluralForm(count, lang);
      const translation = pluralTranslations[pluralForm] || pluralTranslations.other;
      return this.interpolate(translation, { ...params, count });
    }

    // Fallback to regular translation
    return this.t(key, { ...params, count }, locale);
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options: DateFormatOptions = {}, locale?: 'ar' | 'en'): string {
    if (!this.config.enableDateFormatting) {
      return date.toISOString();
    }

    const lang = locale || this.currentLanguage;
    
    try {
      if (lang === 'ar') {
        // Use Arabic locale for date formatting
        const formatStr = this.getDateFormatString(options);
        return format(date, formatStr, { locale: ar });
      } else {
        const formatStr = this.getDateFormatString(options);
        return format(date, formatStr);
      }
    } catch (error) {
      return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');
    }
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options: NumberFormatOptions = {}, locale?: 'ar' | 'en'): string {
    if (!this.config.enableNumberFormatting) {
      return number.toString();
    }

    const lang = locale || this.currentLanguage;
    
    try {
      const formatter = new Intl.NumberFormat(
        lang === 'ar' ? 'ar-SA' : 'en-US',
        {
          style: options.style || 'decimal',
          currency: options.currency || 'SAR',
          minimumFractionDigits: options.minimumFractionDigits,
          maximumFractionDigits: options.maximumFractionDigits
        }
      );

      let formatted = formatter.format(number);

      // Convert to Arabic numerals if requested
      if (lang === 'ar' && options.useArabicNumerals) {
        formatted = this.toArabicNumerals(formatted);
      }

      return formatted;
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Convert Western numerals to Arabic numerals
   */
  toArabicNumerals(text: string): string {
    return text.replace(/[0-9]/g, (digit) => {
      const arabicDigit = this.arabicNumerals[parseInt(digit)];
      return arabicDigit || digit;
    });
  }

  /**
   * Convert Arabic numerals to Western numerals
   */
  fromArabicNumerals(text: string): string {
    return text.replace(/[٠-٩]/g, (digit) => 
      this.arabicNumerals.indexOf(digit).toString()
    );
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Interpolate parameters in translation string
   */
  private interpolate(template: string, params?: Record<string, any>): string {
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * Get plural form based on Arabic/English rules
   */
  private getPluralForm(count: number, language: 'ar' | 'en'): keyof PluralTranslation {
    if (language === 'ar') {
      // Arabic plural rules
      if (count === 0) return 'zero';
      if (count === 1) return 'one';
      if (count === 2) return 'two';
      if (count >= 3 && count <= 10) return 'few';
      if (count >= 11 && count <= 99) return 'many';
      return 'other';
    } else {
      // English plural rules
      return count === 1 ? 'one' : 'other';
    }
  }

  /**
   * Get date format string based on options
   */
  private getDateFormatString(options: DateFormatOptions): string {
    const { dateStyle = 'medium', timeStyle } = options;
    
    const dateFormats = {
      full: 'EEEE, MMMM do, yyyy',
      long: 'MMMM do, yyyy',
      medium: 'MMM d, yyyy',
      short: 'MM/dd/yyyy'
    };

    const timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };

    let formatStr = dateFormats[dateStyle];
    
    if (timeStyle) {
      formatStr += ` ${timeFormats[timeStyle]}`;
    }

    return formatStr;
  }

  /**
   * Add custom translations
   */
  addTranslations(language: 'ar' | 'en', newTranslations: any): void {
    this.translations[language] = {
      ...this.translations[language],
      ...newTranslations
    };
  }

  /**
   * Get direction for CSS
   */
  getDirection(): 'rtl' | 'ltr' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  /**
   * Get text alignment for CSS
   */
  getTextAlign(): 'right' | 'left' {
    return this.isRTL() ? 'right' : 'left';
  }
}

// Create global instance
export const i18n = new I18nManager();

/**
 * Simple translation function
 */
export const t = (key: string, params?: Record<string, any>, locale?: 'ar' | 'en'): string => {
  return i18n.t(key, params, locale);
};

/**
 * Plural translation function
 */
export const tPlural = (key: string, count: number, params?: Record<string, any>, locale?: 'ar' | 'en'): string => {
  return i18n.tPlural(key, count, params, locale);
};

/**
 * Date formatting function
 */
export const formatDate = (date: Date, options?: DateFormatOptions, locale?: 'ar' | 'en'): string => {
  return i18n.formatDate(date, options, locale);
};

/**
 * Number formatting function
 */
export const formatNumber = (number: number, options?: NumberFormatOptions, locale?: 'ar' | 'en'): string => {
  return i18n.formatNumber(number, options, locale);
};