/**
 * Validation utilities
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validateSaudiID = (id) => {
    // Saudi national ID validation
    if (!/^\d{10}$/.test(id))
        return false;
    const digits = id.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const digit = digits[i];
        if (digit !== undefined) {
            sum += digit * (10 - i);
        }
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    const lastDigit = digits[9];
    return lastDigit !== undefined && checkDigit === lastDigit;
};
//# sourceMappingURL=validation.js.map