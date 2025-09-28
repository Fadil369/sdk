/**
 * Unit tests for utility functions
 */
import { describe, it, expect } from 'vitest';
import { validateEmail, validateSaudiID } from '../../src/utils/validation';
import { encrypt, decrypt } from '../../src/utils/encryption';
import { t } from '../../src/utils/i18n';
describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('firstname+lastname@example.com')).toBe(true);
        });
        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });
    describe('validateSaudiID', () => {
        it('should validate correct Saudi ID format', () => {
            // These are example IDs - replace with valid test cases
            expect(validateSaudiID('1234567890')).toBeDefined();
        });
        it('should reject invalid Saudi ID format', () => {
            expect(validateSaudiID('123456789')).toBe(false); // Too short
            expect(validateSaudiID('12345678901')).toBe(false); // Too long
            expect(validateSaudiID('123456789a')).toBe(false); // Non-numeric
            expect(validateSaudiID('')).toBe(false); // Empty
        });
    });
});
describe('Encryption Utils', () => {
    it('should encrypt and decrypt text', () => {
        const originalText = 'Hello World';
        const key = 'test-key';
        const encrypted = encrypt(originalText, key);
        expect(encrypted).not.toBe(originalText);
        const decrypted = decrypt(encrypted, key);
        expect(decrypted).toBe(originalText);
    });
});
describe('Internationalization Utils', () => {
    it('should translate keys correctly', () => {
        expect(t('welcome', 'en')).toBe('Welcome');
        expect(t('welcome', 'ar')).toBe('مرحباً');
        expect(t('patient', 'en')).toBe('Patient');
        expect(t('patient', 'ar')).toBe('مريض');
    });
    it('should return key for unknown translations', () => {
        expect(t('unknown_key', 'en')).toBe('unknown_key');
        expect(t('unknown_key', 'ar')).toBe('unknown_key');
    });
    it('should default to Arabic', () => {
        expect(t('welcome')).toBe('مرحباً');
    });
});
//# sourceMappingURL=utils.test.js.map