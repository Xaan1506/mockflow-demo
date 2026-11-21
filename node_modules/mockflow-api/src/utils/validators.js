/**
 * Validation helpers for types, queries, and bodies.
 */

export function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

export function isString(val) {
  return typeof val === 'string';
}

export function isNumber(val) {
  return typeof val === 'number' && !Number.isNaN(val);
}

export function isBoolean(val) {
  return typeof val === 'boolean';
}

/**
 * Coerce string query parameters to appropriate JS primitive types.
 */
export function coerceValue(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;

  // Check if numeric (integer or float)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }

  return val;
}
