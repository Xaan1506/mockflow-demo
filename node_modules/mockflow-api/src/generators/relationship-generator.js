import { faker } from '@faker-js/faker';

/**
 * Resolves relationships between generated items in memory.
 * For many-to-one: sets the foreign key field (e.g. userId) on the target record
 * to an existing ID from the related collection.
 * For one-to-one: assigns distinct foreign keys without duplicates.
 */
export function resolveRelationships(dataStore, normalizedSchema) {
  for (const [colName, colDef] of Object.entries(normalizedSchema)) {
    const relationships = colDef.relationships || {};
    const records = dataStore[colName] || [];

    for (const [relKey, relDef] of Object.entries(relationships)) {
      const targetCol = relDef.collection;
      const targetRecords = dataStore[targetCol] || [];
      const targetIds = targetRecords.map(r => r.id);

      if (targetIds.length === 0) continue;

      if (relDef.type === 'many-to-one') {
        for (const record of records) {
          record[relKey] = faker.helpers.arrayElement(targetIds);
        }
      } else if (relDef.type === 'one-to-one') {
        const shuffled = faker.helpers.shuffle([...targetIds]);
        for (let i = 0; i < records.length; i++) {
          records[i][relKey] = i < shuffled.length ? shuffled[i] : null;
        }
      }
    }
  }

  return dataStore;
}
