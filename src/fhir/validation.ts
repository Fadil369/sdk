/**
 * FHIR Resource Validation
 * Including Saudi Arabia specific validation rules
 */

import {
  FHIRResource,
  FHIRPatient,
  FHIROperationOutcome,
  SaudiPatientExtension,
} from '@/types/fhir';
import { validateSaudiID } from '@/utils/validation';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'information';
  code: string;
  message: string;
  path?: string;
}

export class FHIRValidator {
  /**
   * Validate a FHIR resource
   */
  validateResource(resource: FHIRResource): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Basic FHIR validation
    this.validateBasicFHIR(resource, issues);

    // Resource-specific validation
    switch (resource.resourceType) {
      case 'Patient':
        this.validatePatient(resource as FHIRPatient, issues);
        break;
      // Add more resource types as needed
    }

    // Saudi Arabia specific validation
    this.validateSaudiExtensions(resource, issues);

    return {
      isValid: !issues.some(issue => issue.severity === 'error'),
      issues,
    };
  }

  /**
   * Convert validation result to FHIR OperationOutcome
   */
  toOperationOutcome(result: ValidationResult): FHIROperationOutcome {
    return {
      resourceType: 'OperationOutcome',
      issue: result.issues.map(issue => ({
        severity:
          issue.severity === 'error'
            ? 'error'
            : issue.severity === 'warning'
              ? 'warning'
              : 'information',
        code: issue.code,
        diagnostics: issue.message,
        expression: issue.path ? [issue.path] : undefined,
      })),
    };
  }

  private validateBasicFHIR(resource: FHIRResource, issues: ValidationIssue[]): void {
    // Check required fields
    if (!resource.resourceType) {
      issues.push({
        severity: 'error',
        code: 'required',
        message: 'resourceType is required',
        path: 'resourceType',
      });
    }

    // Validate meta if present
    if (resource.meta) {
      if (resource.meta.versionId && !/^\d+$/.test(resource.meta.versionId)) {
        issues.push({
          severity: 'error',
          code: 'invalid',
          message: 'meta.versionId must be a numeric string',
          path: 'meta.versionId',
        });
      }

      if (resource.meta.lastUpdated) {
        if (!this.isValidDateTime(resource.meta.lastUpdated)) {
          issues.push({
            severity: 'error',
            code: 'invalid',
            message: 'meta.lastUpdated must be a valid ISO 8601 datetime',
            path: 'meta.lastUpdated',
          });
        }
      }
    }
  }

  private validatePatient(patient: FHIRPatient, issues: ValidationIssue[]): void {
    // Validate identifiers
    if (patient.identifier) {
      patient.identifier.forEach((identifier, index) => {
        if (!identifier.system && !identifier.value) {
          issues.push({
            severity: 'error',
            code: 'required',
            message: 'Identifier must have either system or value',
            path: `identifier[${index}]`,
          });
        }

        // Saudi National ID validation
        if (
          identifier.system === 'https://fhir.nphies.sa/CodeSystem/identifier' &&
          identifier.value
        ) {
          if (!validateSaudiID(identifier.value)) {
            issues.push({
              severity: 'error',
              code: 'invalid',
              message: 'Invalid Saudi National ID format',
              path: `identifier[${index}].value`,
            });
          }
        }
      });
    }

    // Validate names
    if (patient.name) {
      patient.name.forEach((name, index) => {
        if (!name.family && (!name.given || name.given.length === 0)) {
          issues.push({
            severity: 'warning',
            code: 'incomplete',
            message: 'Name should have either family name or given name',
            path: `name[${index}]`,
          });
        }

        // Arabic name validation for Saudi patients
        if (name.family && this.containsArabic(name.family)) {
          this.validateArabicText(name.family, `name[${index}].family`, issues);
        }

        if (name.given) {
          name.given.forEach((given, givenIndex) => {
            if (this.containsArabic(given)) {
              this.validateArabicText(given, `name[${index}].given[${givenIndex}]`, issues);
            }
          });
        }
      });
    }

    // Validate birth date
    if (patient.birthDate) {
      if (!this.isValidDate(patient.birthDate)) {
        issues.push({
          severity: 'error',
          code: 'invalid',
          message: 'birthDate must be a valid date in YYYY-MM-DD format',
          path: 'birthDate',
        });
      } else {
        // Check if patient is over 150 years old
        const birthYear = new Date(patient.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - birthYear > 150) {
          issues.push({
            severity: 'warning',
            code: 'unusual',
            message: 'Patient age appears to be over 150 years',
            path: 'birthDate',
          });
        }
      }
    }

    // Validate telecom
    if (patient.telecom) {
      patient.telecom.forEach((telecom, index) => {
        if (telecom.system === 'phone' && telecom.value) {
          // Saudi phone number validation
          if (!this.isValidSaudiPhoneNumber(telecom.value)) {
            issues.push({
              severity: 'warning',
              code: 'invalid-format',
              message: 'Phone number does not match Saudi Arabia format',
              path: `telecom[${index}].value`,
            });
          }
        }

        if (telecom.system === 'email' && telecom.value) {
          if (!this.isValidEmail(telecom.value)) {
            issues.push({
              severity: 'error',
              code: 'invalid',
              message: 'Invalid email format',
              path: `telecom[${index}].value`,
            });
          }
        }
      });
    }

    // Validate addresses
    if (patient.address) {
      patient.address.forEach((address, index) => {
        if (address.country === 'SA' || address.country === 'Saudi Arabia') {
          // Validate Saudi postal code
          if (address.postalCode && !this.isValidSaudiPostalCode(address.postalCode)) {
            issues.push({
              severity: 'warning',
              code: 'invalid-format',
              message: 'Postal code does not match Saudi Arabia format (5 digits)',
              path: `address[${index}].postalCode`,
            });
          }

          // Validate city names contain Arabic
          if (address.city && !this.containsArabic(address.city)) {
            issues.push({
              severity: 'information',
              code: 'localization',
              message: 'City name should include Arabic text for Saudi addresses',
              path: `address[${index}].city`,
            });
          }
        }
      });
    }
  }

  private validateSaudiExtensions(resource: FHIRResource, issues: ValidationIssue[]): void {
    if (resource.resourceType === 'Patient') {
      const patient = resource as FHIRPatient & {
        extension?: Array<{ url: string; valueString?: string }>;
      };

      if (patient.extension) {
        patient.extension.forEach((ext, index) => {
          if (ext.url === 'https://fhir.nphies.sa/StructureDefinition/saudi-patient') {
            // Validate Saudi patient extension
            if (ext.valueString) {
              try {
                const saudiExt = JSON.parse(ext.valueString) as SaudiPatientExtension;

                if (saudiExt.saudiNationalId && !validateSaudiID(saudiExt.saudiNationalId)) {
                  issues.push({
                    severity: 'error',
                    code: 'invalid',
                    message: 'Invalid Saudi National ID in extension',
                    path: `extension[${index}].valueString.saudiNationalId`,
                  });
                }

                if (
                  saudiExt.residencyType &&
                  !['citizen', 'resident', 'visitor'].includes(saudiExt.residencyType)
                ) {
                  issues.push({
                    severity: 'error',
                    code: 'invalid',
                    message: 'Invalid residency type. Must be citizen, resident, or visitor',
                    path: `extension[${index}].valueString.residencyType`,
                  });
                }
              } catch (error) {
                issues.push({
                  severity: 'error',
                  code: 'invalid',
                  message: 'Invalid JSON in Saudi patient extension',
                  path: `extension[${index}].valueString`,
                });
              }
            }
          }
        });
      }
    }
  }

  private isValidDateTime(dateTime: string): boolean {
    return !isNaN(Date.parse(dateTime));
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidSaudiPhoneNumber(phone: string): boolean {
    // Saudi phone numbers: +966XXXXXXXXX or 05XXXXXXXX
    return /^(\+966|966|0)?5[0-9]{8}$/.test(phone.replace(/[\s-]/g, ''));
  }

  private isValidSaudiPostalCode(postalCode: string): boolean {
    return /^\d{5}$/.test(postalCode);
  }

  private containsArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  private validateArabicText(text: string, path: string, issues: ValidationIssue[]): void {
    // Basic Arabic text validation
    if (text.length > 0 && !this.containsArabic(text)) {
      issues.push({
        severity: 'information',
        code: 'localization',
        message: 'Text should contain Arabic characters for Saudi localization',
        path,
      });
    }

    // Check for mixed scripts (Arabic + Latin) which might indicate data quality issues
    const hasArabic = this.containsArabic(text);
    const hasLatin = /[a-zA-Z]/.test(text);

    if (hasArabic && hasLatin && text.length > 20) {
      issues.push({
        severity: 'warning',
        code: 'mixed-script',
        message: 'Text contains mixed Arabic and Latin scripts',
        path,
      });
    }
  }
}

export const fhirValidator = new FHIRValidator();
