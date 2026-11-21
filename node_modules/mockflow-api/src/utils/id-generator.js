import crypto from 'node:crypto';

/**
 * Generate a unique ID.
 * Supports uuid v4 or integer sequence/custom prefixes.
 * Default is a standard 1-based incrementing ID (stringified) or UUID.
 */
export class IdGenerator {
  constructor(options = {}) {
    this.type = options.type || 'integer'; // 'integer' | 'uuid'
    this.prefix = options.prefix || '';
    this.counter = 0;
  }

  next() {
    if (this.type === 'uuid') {
      return crypto.randomUUID();
    }
    this.counter += 1;
    return this.prefix ? `${this.prefix}${this.counter}` : this.counter;
  }

  reset() {
    this.counter = 0;
  }
}

export function generateUUID() {
  return crypto.randomUUID();
}
