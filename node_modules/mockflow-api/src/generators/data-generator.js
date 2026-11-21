import { faker } from '@faker-js/faker';
import { generateFieldValue } from './field-generator.js';
import { resolveRelationships } from './relationship-generator.js';
import { IdGenerator } from '../utils/id-generator.js';

/**
 * Generates records for all collections defined in normalized schema.
 */
export function generateDataset(normalizedSchema, options = {}) {
  const seed = options.seed;
  const customGenerators = options.customGenerators || {};

  if (seed !== undefined) {
    faker.seed(typeof seed === 'number' ? seed : Number(seed) || 12345);
  }

  const idGen = new IdGenerator({ type: options.idType || 'integer' });
  const dataStore = {};

  for (const [colName, colDef] of Object.entries(normalizedSchema)) {
    dataStore[colName] = [];
    const count = colDef.count;

    for (let i = 0; i < count; i++) {
      const record = {
        id: idGen.next()
      };

      for (const [fieldName, fieldDef] of Object.entries(colDef.fields)) {
        record[fieldName] = generateFieldValue(fieldDef, customGenerators);
      }

      dataStore[colName].push(record);
    }
  }

  // Resolve relationships across collections
  resolveRelationships(dataStore, normalizedSchema);

  return dataStore;
}
