/**
 * Saudi Arabia FHIR Extensions and Profiles
 * Specific extensions and utilities for Saudi healthcare system
 */

import { FHIRPatient, FHIRIdentifier } from '@/types/fhir';
import { validateSaudiID } from '@/utils/validation';

// Saudi Arabia specific systems and URLs
export const SAUDI_SYSTEMS = {
  NATIONAL_ID: 'https://fhir.nphies.sa/CodeSystem/identifier',
  FAMILY_CARD: 'https://fhir.nphies.sa/CodeSystem/family-card',
  SPONSOR_ID: 'https://fhir.nphies.sa/CodeSystem/sponsor',
  REGION: 'https://fhir.nphies.sa/CodeSystem/region',
  RESIDENCY_TYPE: 'https://fhir.nphies.sa/CodeSystem/residency-type',
  PATIENT_EXTENSION: 'https://fhir.nphies.sa/StructureDefinition/saudi-patient',
} as const;

// Saudi regions
export const SAUDI_REGIONS = [
  'riyadh',
  'makkah',
  'madinah',
  'qassim',
  'eastern',
  'asir',
  'tabuk',
  'hail',
  'northern-borders',
  'jazan',
  'najran',
  'al-bahah',
  'al-jawf',
] as const;

export type SaudiRegion = (typeof SAUDI_REGIONS)[number];
export type ResidencyType = 'citizen' | 'resident' | 'visitor';

export interface SaudiPatientProfile extends FHIRPatient {
  // Required Saudi identifiers
  identifier: FHIRIdentifier[];

  // Saudi-specific extension
  extension?: Array<{
    url: typeof SAUDI_SYSTEMS.PATIENT_EXTENSION;
    extension: Array<{
      url: string;
      valueString?: string;
      valueCode?: string;
      valueBoolean?: boolean;
    }>;
  }>;
}

export class SaudiPatientBuilder {
  private patient: Partial<SaudiPatientProfile>;

  constructor() {
    this.patient = {
      resourceType: 'Patient',
      identifier: [],
      name: [],
      extension: [],
    };
  }

  /**
   * Set Saudi National ID
   */
  setSaudiNationalId(nationalId: string, skipValidation = false): SaudiPatientBuilder {
    if (!skipValidation && !validateSaudiID(nationalId)) {
      throw new Error('Invalid Saudi National ID format');
    }

    const identifier: FHIRIdentifier = {
      use: 'official',
      system: SAUDI_SYSTEMS.NATIONAL_ID,
      value: nationalId,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'NI',
            display: 'National identifier',
          },
        ],
        text: 'Saudi National ID',
      },
    };

    this.patient.identifier = this.patient.identifier || [];
    this.patient.identifier.push(identifier);

    return this;
  }

  /**
   * Set family card number
   */
  setFamilyCardNumber(familyCard: string): SaudiPatientBuilder {
    const identifier: FHIRIdentifier = {
      use: 'secondary',
      system: SAUDI_SYSTEMS.FAMILY_CARD,
      value: familyCard,
      type: {
        coding: [
          {
            system: SAUDI_SYSTEMS.FAMILY_CARD,
            code: 'FC',
            display: 'Family Card',
          },
        ],
        text: 'Saudi Family Card Number',
      },
    };

    this.patient.identifier = this.patient.identifier || [];
    this.patient.identifier.push(identifier);

    return this;
  }

  /**
   * Set sponsor ID (for residents and visitors)
   */
  setSponsorId(sponsorId: string): SaudiPatientBuilder {
    const identifier: FHIRIdentifier = {
      use: 'secondary',
      system: SAUDI_SYSTEMS.SPONSOR_ID,
      value: sponsorId,
      type: {
        coding: [
          {
            system: SAUDI_SYSTEMS.SPONSOR_ID,
            code: 'SPONSOR',
            display: 'Sponsor ID',
          },
        ],
        text: 'Saudi Sponsor ID',
      },
    };

    this.patient.identifier = this.patient.identifier || [];
    this.patient.identifier.push(identifier);

    return this;
  }

  /**
   * Set residency type
   */
  setResidencyType(type: ResidencyType): SaudiPatientBuilder {
    this.addExtension('residency-type', type);
    return this;
  }

  /**
   * Set Saudi region
   */
  setRegion(region: SaudiRegion): SaudiPatientBuilder {
    if (!SAUDI_REGIONS.includes(region)) {
      throw new Error(`Invalid Saudi region: ${region}`);
    }

    this.addExtension('region', region);
    return this;
  }

  /**
   * Set Arabic name
   */
  setArabicName(family: string, given: string[]): SaudiPatientBuilder {
    const name = {
      use: 'official' as const,
      family,
      given,
    };

    this.patient.name = this.patient.name || [];
    this.patient.name.push(name);

    return this;
  }

  /**
   * Set English name
   */
  setEnglishName(family: string, given: string[]): SaudiPatientBuilder {
    const name = {
      use: 'usual' as const,
      family,
      given,
    };

    this.patient.name = this.patient.name || [];
    this.patient.name.push(name);

    return this;
  }

  /**
   * Set basic patient information
   */
  setBasicInfo(
    gender: 'male' | 'female' | 'other' | 'unknown',
    birthDate: string
  ): SaudiPatientBuilder {
    this.patient.gender = gender;
    this.patient.birthDate = birthDate;
    return this;
  }

  /**
   * Set Saudi phone number
   */
  setSaudiPhoneNumber(
    phoneNumber: string,
    use: 'home' | 'work' | 'mobile' = 'mobile'
  ): SaudiPatientBuilder {
    // Normalize Saudi phone number
    const normalizedPhone = this.normalizeSaudiPhoneNumber(phoneNumber);

    const telecom = {
      system: 'phone' as const,
      value: normalizedPhone,
      use,
    };

    this.patient.telecom = this.patient.telecom || [];
    this.patient.telecom.push(telecom);

    return this;
  }

  /**
   * Set Saudi address
   */
  setSaudiAddress(
    city: string,
    district?: string,
    postalCode?: string,
    addressLine?: string[]
  ): SaudiPatientBuilder {
    const address = {
      use: 'home' as const,
      type: 'physical' as const,
      line: addressLine,
      city,
      district,
      state: '', // Saudi doesn't use states, but regions
      postalCode,
      country: 'SA',
    };

    this.patient.address = this.patient.address || [];
    this.patient.address.push(address);

    return this;
  }

  /**
   * Build the Saudi patient profile
   */
  build(): SaudiPatientProfile {
    if (!this.patient.identifier || this.patient.identifier.length === 0) {
      throw new Error('Saudi patient must have at least one identifier');
    }

    // Ensure we have a Saudi National ID
    const hasNationalId = this.patient.identifier.some(
      id => id.system === SAUDI_SYSTEMS.NATIONAL_ID
    );

    if (!hasNationalId) {
      throw new Error('Saudi patient must have a National ID');
    }

    return this.patient as SaudiPatientProfile;
  }

  private addExtension(url: string, value: string): void {
    this.patient.extension = this.patient.extension || [];

    let saudiExtension = this.patient.extension.find(
      ext => ext.url === SAUDI_SYSTEMS.PATIENT_EXTENSION
    );

    if (!saudiExtension) {
      saudiExtension = {
        url: SAUDI_SYSTEMS.PATIENT_EXTENSION,
        extension: [],
      };
      this.patient.extension.push(saudiExtension);
    }

    saudiExtension.extension.push({
      url,
      valueString: value,
    });
  }

  private normalizeSaudiPhoneNumber(phone: string): string {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Add +966 prefix if not present
    if (cleaned.startsWith('05')) {
      return `+966${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('5')) {
      return `+966${cleaned}`;
    } else if (cleaned.startsWith('966')) {
      return `+${cleaned}`;
    } else if (!cleaned.startsWith('+966')) {
      return `+966${cleaned}`;
    }

    return cleaned;
  }
}

export class SaudiExtensionHelper {
  /**
   * Extract Saudi National ID from patient
   */
  static getSaudiNationalId(patient: FHIRPatient): string | undefined {
    return patient.identifier?.find(id => id.system === SAUDI_SYSTEMS.NATIONAL_ID)?.value;
  }

  /**
   * Extract family card number from patient
   */
  static getFamilyCardNumber(patient: FHIRPatient): string | undefined {
    return patient.identifier?.find(id => id.system === SAUDI_SYSTEMS.FAMILY_CARD)?.value;
  }

  /**
   * Extract residency type from patient extension
   */
  static getResidencyType(patient: FHIRPatient): ResidencyType | undefined {
    return this.getExtensionValue(patient, 'residency-type') as ResidencyType;
  }

  /**
   * Extract region from patient extension
   */
  static getRegion(patient: FHIRPatient): SaudiRegion | undefined {
    return this.getExtensionValue(patient, 'region') as SaudiRegion;
  }

  /**
   * Check if patient is a Saudi citizen
   */
  static isSaudiCitizen(patient: FHIRPatient): boolean {
    const residencyType = this.getResidencyType(patient);
    return residencyType === 'citizen';
  }

  /**
   * Get Arabic name from patient
   */
  static getArabicName(patient: FHIRPatient): { family?: string; given?: string[] } | undefined {
    const arabicName = patient.name?.find(name => name.use === 'official');
    return arabicName
      ? {
          family: arabicName.family,
          given: arabicName.given,
        }
      : undefined;
  }

  /**
   * Get English name from patient
   */
  static getEnglishName(patient: FHIRPatient): { family?: string; given?: string[] } | undefined {
    const englishName = patient.name?.find(name => name.use === 'usual');
    return englishName
      ? {
          family: englishName.family,
          given: englishName.given,
        }
      : undefined;
  }

  private static getExtensionValue(patient: FHIRPatient, url: string): string | undefined {
    const saudiExtension = (patient as any).extension?.find(
      (ext: any) => ext.url === SAUDI_SYSTEMS.PATIENT_EXTENSION
    );

    if (!saudiExtension) return undefined;

    const subExtension = saudiExtension.extension?.find((ext: any) => ext.url === url);

    return subExtension?.valueString;
  }
}

/**
 * Create a new Saudi patient builder
 */
export function createSaudiPatient(): SaudiPatientBuilder {
  return new SaudiPatientBuilder();
}
