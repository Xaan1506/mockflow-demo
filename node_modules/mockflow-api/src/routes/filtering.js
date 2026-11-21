import { coerceValue } from '../utils/validators.js';

/**
 * Filter items by query parameters.
 * Supports:
 * - Exact match: ?role=admin
 * - Greater than: ?age_gt=18
 * - Greater than or equal: ?price_gte=100
 * - Less than: ?age_lt=30
 * - Less than or equal: ?price_lte=1000
 * - Not equal: ?role_ne=admin
 * - Inclusion: ?role_in=admin,user
 * - Exclusion: ?role_nin=guest,banned
 */
export function applyFiltering(items, query = {}) {
  // Ignored reserved query params for pagination, sorting, search, include
  const reservedParams = new Set([
    'page',
    'limit',
    'sort',
    'order',
    'search',
    'include',
    '_',
    'delay'
  ]);

  const filterRules = [];

  for (const [key, rawValue] of Object.entries(query)) {
    if (reservedParams.has(key)) continue;

    if (key.endsWith('_gte')) {
      const field = key.slice(0, -4);
      filterRules.push({ field, op: 'gte', value: coerceValue(rawValue) });
    } else if (key.endsWith('_gt')) {
      const field = key.slice(0, -3);
      filterRules.push({ field, op: 'gt', value: coerceValue(rawValue) });
    } else if (key.endsWith('_lte')) {
      const field = key.slice(0, -4);
      filterRules.push({ field, op: 'lte', value: coerceValue(rawValue) });
    } else if (key.endsWith('_lt')) {
      const field = key.slice(0, -3);
      filterRules.push({ field, op: 'lt', value: coerceValue(rawValue) });
    } else if (key.endsWith('_ne')) {
      const field = key.slice(0, -3);
      filterRules.push({ field, op: 'ne', value: coerceValue(rawValue) });
    } else if (key.endsWith('_in')) {
      const field = key.slice(0, -3);
      const list = String(rawValue).split(',').map(v => coerceValue(v.trim()));
      filterRules.push({ field, op: 'in', value: list });
    } else if (key.endsWith('_nin')) {
      const field = key.slice(0, -4);
      const list = String(rawValue).split(',').map(v => coerceValue(v.trim()));
      filterRules.push({ field, op: 'nin', value: list });
    } else {
      // Exact match
      filterRules.push({ field: key, op: 'eq', value: coerceValue(rawValue) });
    }
  }

  if (filterRules.length === 0) return items;

  return items.filter(item => {
    return filterRules.every(({ field, op, value }) => {
      // Prevent prototype pollution or unsafe property access
      if (!Object.prototype.hasOwnProperty.call(item, field)) {
        return false;
      }

      const itemVal = item[field];

      switch (op) {
        case 'eq':
          if (typeof itemVal === 'string' && typeof value === 'string') {
            return itemVal.toLowerCase() === value.toLowerCase();
          }
          return itemVal === value;

        case 'ne':
          if (typeof itemVal === 'string' && typeof value === 'string') {
            return itemVal.toLowerCase() !== value.toLowerCase();
          }
          return itemVal !== value;

        case 'gt':
          return itemVal > value;

        case 'gte':
          return itemVal >= value;

        case 'lt':
          return itemVal < value;

        case 'lte':
          return itemVal <= value;

        case 'in':
          if (!Array.isArray(value)) return false;
          return value.some(target => {
            if (typeof itemVal === 'string' && typeof target === 'string') {
              return itemVal.toLowerCase() === target.toLowerCase();
            }
            return itemVal === target;
          });

        case 'nin':
          if (!Array.isArray(value)) return true;
          return !value.some(target => {
            if (typeof itemVal === 'string' && typeof target === 'string') {
              return itemVal.toLowerCase() === target.toLowerCase();
            }
            return itemVal === target;
          });

        default:
          return true;
      }
    });
  });
}
