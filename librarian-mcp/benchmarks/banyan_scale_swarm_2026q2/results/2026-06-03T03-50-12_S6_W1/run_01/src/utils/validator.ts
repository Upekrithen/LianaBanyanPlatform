// utils/validator.ts

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateNonEmpty(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} must not be empty`;
  }
  return null;
}

export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validateNonNegativeInteger(value: number, fieldName: string): string | null {
  if (!Number.isInteger(value) || value < 0) {
    return `${fieldName} must be a non-negative integer`;
  }
  return null;
}

export function validateUUID(value: string, fieldName: string): string | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return `${fieldName} must be a valid UUID`;
  }
  return null;
}

export function combineValidations(checks: Array<string | null>): ValidationResult {
  const errors = checks.filter((e): e is string => e !== null);
  return { valid: errors.length === 0, errors };
}
