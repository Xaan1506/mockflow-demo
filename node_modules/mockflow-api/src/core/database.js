import { IdGenerator } from '../utils/id-generator.js';

export class DatabaseError extends Error {
  constructor(message, code = 'DB_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

/**
 * In-memory fast database supporting collections, CRUD, ID lookup, and resets.
 */
export class InMemoryDatabase {
  constructor(options = {}) {
    this.options = options;
    this.collections = new Map(); // collectionName -> Map(id -> record)
    this.idGenerators = new Map();
    this.idType = options.idType || 'integer';
  }

  /**
   * Initializes or loads collections from generated dataset
   */
  loadData(dataset = {}) {
    this.collections.clear();
    this.idGenerators.clear();

    for (const [colName, records] of Object.entries(dataset)) {
      const colMap = new Map();
      let maxIntId = 0;

      for (const record of records) {
        // Deep clone record to prevent unintended external mutations
        const clone = JSON.parse(JSON.stringify(record));
        colMap.set(String(clone.id), clone);

        if (typeof clone.id === 'number' && clone.id > maxIntId) {
          maxIntId = clone.id;
        }
      }

      this.collections.set(colName, colMap);

      const idGen = new IdGenerator({ type: this.idType });
      idGen.counter = maxIntId;
      this.idGenerators.set(colName, idGen);
    }
  }

  ensureCollection(colName) {
    if (!this.collections.has(colName)) {
      this.collections.set(colName, new Map());
      this.idGenerators.set(colName, new IdGenerator({ type: this.idType }));
    }
  }

  hasCollection(colName) {
    return this.collections.has(colName);
  }

  getCollectionNames() {
    return Array.from(this.collections.keys());
  }

  findAll(colName) {
    const col = this.collections.get(colName);
    if (!col) return [];
    return Array.from(col.values()).map(r => ({ ...r }));
  }

  findById(colName, id) {
    const col = this.collections.get(colName);
    if (!col) return null;
    const item = col.get(String(id));
    return item ? { ...item } : null;
  }

  insert(colName, data) {
    this.ensureCollection(colName);
    const col = this.collections.get(colName);
    const idGen = this.idGenerators.get(colName);

    let id = data.id !== undefined && data.id !== null ? data.id : idGen.next();

    // Check if ID already exists
    if (col.has(String(id))) {
      throw new DatabaseError(`Duplicate ID '${id}' in collection '${colName}'`, 'DUPLICATE_ID');
    }

    const record = { ...data, id };
    col.set(String(id), record);
    return { ...record };
  }

  update(colName, id, updates, partial = false) {
    const col = this.collections.get(colName);
    if (!col) return null;

    const existing = col.get(String(id));
    if (!existing) return null;

    // Preserve ID regardless of update payload
    let updated;
    if (partial) {
      updated = { ...existing, ...updates, id: existing.id };
    } else {
      updated = { ...updates, id: existing.id };
    }

    col.set(String(id), updated);
    return { ...updated };
  }

  delete(colName, id) {
    const col = this.collections.get(colName);
    if (!col) return false;
    return col.delete(String(id));
  }

  count(colName) {
    const col = this.collections.get(colName);
    return col ? col.size : 0;
  }

  reset() {
    this.collections.clear();
    this.idGenerators.clear();
  }
}
