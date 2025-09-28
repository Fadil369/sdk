/**
 * Encryption utilities (placeholder)
 */

export const encrypt = (data: string, _key: string): string => {
  // Placeholder implementation
  return Buffer.from(data).toString('base64');
};

export const decrypt = (encryptedData: string, _key: string): string => {
  // Placeholder implementation
  return Buffer.from(encryptedData, 'base64').toString('utf-8');
};
