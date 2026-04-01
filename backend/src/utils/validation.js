export const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export const isNonNegativeNumber = (value) =>
  value !== undefined && value !== null && !Number.isNaN(Number(value)) && Number(value) >= 0;

export const isValidRating = (value) =>
  value !== undefined && value !== null && !Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 5;

export const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
