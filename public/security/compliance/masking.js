/**
 * PHI (Protected Health Information) data masking utilities for HIPAA compliance
 */
export class PHIDataMasker {
    config;
    logger;
    maskingRules = new Map();
    constructor(config, logger) {
        this.config = config;
        this.logger = logger.child({ component: 'PHIDataMasker' });
        this.initializeDefaultRules();
    }
    /**
     * Initialize default masking rules for common PHI fields
     */
    initializeDefaultRules() {
        const defaultRules = [
            // Direct identifiers
            { field: 'ssn', type: 'format', preserveFormat: true, visibleChars: 4 },
            { field: 'nationalId', type: 'format', preserveFormat: true, visibleChars: 4 },
            { field: 'medicalRecordNumber', type: 'partial', visibleChars: 3 },
            { field: 'accountNumber', type: 'partial', visibleChars: 4 },
            // Contact information
            { field: 'phone', type: 'format', preserveFormat: true, visibleChars: 4 },
            { field: 'email', type: 'partial', visibleChars: 2 },
            { field: 'fax', type: 'format', preserveFormat: true, visibleChars: 4 },
            // Names and addresses
            { field: 'firstName', type: 'partial', visibleChars: 1 },
            { field: 'lastName', type: 'partial', visibleChars: 1 },
            { field: 'middleName', type: 'partial', visibleChars: 1 },
            { field: 'address', type: 'partial', visibleChars: 0 },
            { field: 'city', type: 'partial', visibleChars: 2 },
            { field: 'state', type: 'full' },
            { field: 'zipCode', type: 'partial', visibleChars: 2 },
            // Technical identifiers
            { field: 'ipAddress', type: 'format', preserveFormat: true, visibleChars: 0 },
            { field: 'webUrl', type: 'partial', visibleChars: 0 },
            { field: 'deviceId', type: 'hash' },
            { field: 'biometricId', type: 'hash' },
            // Dates (except year)
            { field: 'dateOfBirth', type: 'format', preserveFormat: true, visibleChars: 4 }, // Show only year
            { field: 'admissionDate', type: 'format', preserveFormat: true, visibleChars: 4 },
            { field: 'dischargeDate', type: 'format', preserveFormat: true, visibleChars: 4 },
        ];
        for (const rule of defaultRules) {
            this.maskingRules.set(rule.field, rule);
        }
        this.logger.info('PHI masking rules initialized', { ruleCount: this.maskingRules.size });
    }
    /**
     * Add or update a masking rule
     */
    addMaskingRule(rule) {
        this.maskingRules.set(rule.field, rule);
        this.logger.debug('Masking rule added/updated', { field: rule.field, type: rule.type });
    }
    /**
     * Remove a masking rule
     */
    removeMaskingRule(field) {
        const removed = this.maskingRules.delete(field);
        if (removed) {
            this.logger.debug('Masking rule removed', { field });
        }
        return removed;
    }
    /**
     * Mask a single value based on field type
     */
    maskValue(value, field) {
        if (value === null || value === undefined) {
            return value;
        }
        const stringValue = String(value);
        if (stringValue.length === 0) {
            return value;
        }
        const rule = this.maskingRules.get(field);
        if (!rule) {
            // Default masking for unknown fields
            return this.applyFullMasking(stringValue);
        }
        switch (rule.type) {
            case 'full':
                return this.applyFullMasking(stringValue, rule.preserveLength);
            case 'partial':
                return this.applyPartialMasking(stringValue, rule.visibleChars || 0);
            case 'format':
                return this.applyFormatMasking(stringValue, field, rule.visibleChars || 0);
            case 'hash':
                return this.applyHashMasking(stringValue);
            case 'tokenize':
                return this.applyTokenization(stringValue);
            default:
                return this.applyFullMasking(stringValue);
        }
    }
    /**
     * Mask an entire object, applying rules to known PHI fields
     */
    maskObject(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        const masked = { ...obj };
        for (const [key, value] of Object.entries(masked)) {
            if (Array.isArray(value)) {
                masked[key] = value.map(item => typeof item === 'object' && item !== null
                    ? this.maskObject(item)
                    : this.maskValue(item, key));
            }
            else if (typeof value === 'object' && value !== null) {
                masked[key] = this.maskObject(value);
            }
            else {
                masked[key] = this.maskValue(value, key);
            }
        }
        return masked;
    }
    /**
     * Apply full masking (replace all characters)
     */
    applyFullMasking(value, preserveLength = true) {
        if (!preserveLength) {
            return '***';
        }
        return this.config.defaultMaskChar.repeat(value.length);
    }
    /**
     * Apply partial masking (show first/last few characters)
     */
    applyPartialMasking(value, visibleChars) {
        if (value.length <= visibleChars * 2) {
            return this.config.defaultMaskChar.repeat(Math.max(3, value.length));
        }
        if (visibleChars === 0) {
            return this.config.defaultMaskChar.repeat(value.length);
        }
        const start = value.substring(0, visibleChars);
        const end = value.substring(value.length - visibleChars);
        const middle = this.config.defaultMaskChar.repeat(value.length - visibleChars * 2);
        return start + middle + end;
    }
    /**
     * Apply format-specific masking
     */
    applyFormatMasking(value, field, visibleChars) {
        switch (field) {
            case 'ssn':
                return this.maskSSN(value, visibleChars);
            case 'nationalId':
                return this.maskNationalId(value, visibleChars);
            case 'phone':
                return this.maskPhone(value, visibleChars);
            case 'email':
                return this.maskEmail(value);
            case 'ipAddress':
                return this.maskIPAddress(value);
            case 'dateOfBirth':
            case 'admissionDate':
            case 'dischargeDate':
                return this.maskDate(value, visibleChars);
            default:
                return this.applyPartialMasking(value, visibleChars);
        }
    }
    /**
     * Mask Social Security Number (XXX-XX-1234 format)
     */
    maskSSN(value, visibleChars) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length !== 9) {
            return this.applyPartialMasking(value, visibleChars);
        }
        if (visibleChars >= 4) {
            return `***-**-${cleaned.substring(5)}`;
        }
        else {
            return '***-**-****';
        }
    }
    /**
     * Mask National ID (Saudi format: 1234567890)
     */
    maskNationalId(value, visibleChars) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length !== 10) {
            return this.applyPartialMasking(value, visibleChars);
        }
        if (visibleChars >= 4) {
            return `******${cleaned.substring(6)}`;
        }
        else {
            return '**********';
        }
    }
    /**
     * Mask phone number
     */
    maskPhone(value, visibleChars) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 10) {
            // US format: (XXX) XXX-1234
            if (visibleChars >= 4) {
                return `(***) ***-${cleaned.substring(6)}`;
            }
            else {
                return '(***) ***-****';
            }
        }
        else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            // US with country code: 1-XXX-XXX-1234
            if (visibleChars >= 4) {
                return `1-***-***-${cleaned.substring(7)}`;
            }
            else {
                return '1-***-***-****';
            }
        }
        else {
            return this.applyPartialMasking(value, visibleChars);
        }
    }
    /**
     * Mask email address
     */
    maskEmail(value) {
        const atIndex = value.indexOf('@');
        if (atIndex === -1) {
            return this.applyPartialMasking(value, 2);
        }
        const username = value.substring(0, atIndex);
        const domain = value.substring(atIndex + 1);
        const maskedUsername = username.length > 2
            ? `${username.substring(0, 1)}***${username.substring(username.length - 1)}`
            : '***';
        const dotIndex = domain.lastIndexOf('.');
        if (dotIndex === -1) {
            return `${maskedUsername}@***`;
        }
        const domainName = domain.substring(0, dotIndex);
        const tld = domain.substring(dotIndex);
        const maskedDomain = `***${tld}`;
        return `${maskedUsername}@${maskedDomain}`;
    }
    /**
     * Mask IP address
     */
    maskIPAddress(value) {
        const parts = value.split('.');
        if (parts.length === 4) {
            return '***.***.***.***';
        }
        // IPv6 or other format
        return this.applyFullMasking(value);
    }
    /**
     * Mask date (keep only year if specified)
     */
    maskDate(value, visibleChars) {
        // Try to parse as ISO date or common formats
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return this.applyPartialMasking(value, visibleChars);
        }
        if (visibleChars >= 4) {
            return `****-**-** (${date.getFullYear()})`;
        }
        else {
            return '****-**-**';
        }
    }
    /**
     * Apply hash masking (one-way hash for consistent masking)
     */
    applyHashMasking(value) {
        // Simple hash function for demonstration
        // In production, use a proper cryptographic hash
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `HASH_${Math.abs(hash).toString(16).toUpperCase()}`;
    }
    /**
     * Apply tokenization (replace with a token)
     */
    applyTokenization(value) {
        // Simple tokenization for demonstration
        // In production, use a secure tokenization service
        const tokenId = Math.random().toString(36).substring(2, 15);
        return `TOKEN_${tokenId.toUpperCase()}`;
    }
    /**
     * Check if a field contains PHI
     */
    isPHIField(field) {
        return this.maskingRules.has(field);
    }
    /**
     * Get masking statistics
     */
    getMaskingStats() {
        const rulesByType = {};
        const phiFields = [];
        for (const [field, rule] of this.maskingRules.entries()) {
            rulesByType[rule.type] = (rulesByType[rule.type] || 0) + 1;
            phiFields.push(field);
        }
        return {
            totalRules: this.maskingRules.size,
            rulesByType,
            phiFields: phiFields.sort(),
        };
    }
    /**
     * Validate masking configuration
     */
    validateConfiguration() {
        const errors = [];
        if (!this.config.defaultMaskChar || this.config.defaultMaskChar.length !== 1) {
            errors.push('Default mask character must be a single character');
        }
        if (this.maskingRules.size === 0) {
            errors.push('No masking rules defined');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
/**
 * Factory function to create PHI data masker
 */
export function createPHIDataMasker(config, logger) {
    return new PHIDataMasker(config, logger);
}
/**
 * Default masking configuration
 */
export const defaultMaskingConfig = {
    defaultMaskChar: '*',
    preserveFormat: true,
    maskingPatterns: {
        ssn: true,
        phone: true,
        email: true,
        nationalId: true,
        medicalRecordNumber: true,
        accountNumber: true,
        certificateNumber: true,
        vehicleIdentifier: true,
        deviceIdentifier: true,
        webUrl: true,
        ipAddress: true,
        biometricIdentifier: true,
        facePhotograph: true,
        otherUniqueIdentifier: true,
    },
};
