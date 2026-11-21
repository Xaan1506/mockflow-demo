import fs from 'node:fs';
import path from 'node:path';
import { isObject } from '../utils/validators.js';

export const SUPPORTED_FIELD_TYPES = new Set([
  'string',
  'number',
  'integer',
  'boolean',
  'email',
  'firstName',
  'lastName',
  'fullName',
  'phoneNumber',
  'address',
  'city',
  'country',
  'companyName',
  'productName',
  'price',
  'date',
  'uuid',
  'url',
  'paragraph',
  'sentence',
  'word',
  'imageUrl'
]);

export class SchemaValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'SchemaValidationError';
    this.details = details;
  }
}

/**
 * Validates and normalizes raw schema definition.
 */
export function validateSchema(rawSchema, customGenerators = {}) {
  if (!isObject(rawSchema)) {
    throw new SchemaValidationError('Schema must be a valid JSON object defining collections');
  }

  const collections = Object.keys(rawSchema);
  if (collections.length === 0) {
    throw new SchemaValidationError('Schema must contain at least one collection definition');
  }

  const normalized = {};

  for (const [colName, colDef] of Object.entries(rawSchema)) {
    if (!isObject(colDef)) {
      throw new SchemaValidationError(`Collection '${colName}' must be an object definition`);
    }

    const count = colDef.count !== undefined ? colDef.count : 10;
    if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
      throw new SchemaValidationError(`Collection '${colName}'.count must be a non-negative integer`);
    }

    if (!isObject(colDef.fields)) {
      throw new SchemaValidationError(`Collection '${colName}' must have a 'fields' object definition`);
    }

    const normalizedFields = {};
    for (const [fieldName, fieldDef] of Object.entries(colDef.fields)) {
      if (typeof fieldDef === 'string') {
        const type = fieldDef;
        if (!SUPPORTED_FIELD_TYPES.has(type) && !customGenerators[type]) {
          throw new SchemaValidationError(
            `Collection '${colName}' field '${fieldName}' has unknown type '${type}'`
          );
        }
        normalizedFields[fieldName] = { type };
      } else if (isObject(fieldDef)) {
        if (!fieldDef.type) {
          throw new SchemaValidationError(
            `Collection '${colName}' field '${fieldName}' definition object requires a 'type' property`
          );
        }
        if (!SUPPORTED_FIELD_TYPES.has(fieldDef.type) && !customGenerators[fieldDef.type]) {
          throw new SchemaValidationError(
            `Collection '${colName}' field '${fieldName}' has unknown type '${fieldDef.type}'`
          );
        }
        normalizedFields[fieldName] = { ...fieldDef };
      } else {
        throw new SchemaValidationError(
          `Collection '${colName}' field '${fieldName}' definition must be a string type or an object`
        );
      }
    }

    // Relationships (optional)
    const normalizedRelationships = {};
    if (colDef.relationships) {
      if (!isObject(colDef.relationships)) {
        throw new SchemaValidationError(`Collection '${colName}'.relationships must be an object`);
      }
      for (const [relKey, relDef] of Object.entries(colDef.relationships)) {
        if (!isObject(relDef) || !relDef.collection || !relDef.type) {
          throw new SchemaValidationError(
            `Relationship '${relKey}' in '${colName}' must specify 'collection' and 'type'`
          );
        }
        const validRelTypes = ['many-to-one', 'one-to-one', 'one-to-many'];
        if (!validRelTypes.includes(relDef.type)) {
          throw new SchemaValidationError(
            `Relationship '${relKey}' in '${colName}' has unsupported type '${relDef.type}'. Must be one of: ${validRelTypes.join(', ')}`
          );
        }
        normalizedRelationships[relKey] = { ...relDef };
      }
    }

    // Searchable fields (optional)
    let searchable = colDef.searchable;
    if (searchable) {
      if (!Array.isArray(searchable)) {
        throw new SchemaValidationError(`Collection '${colName}'.searchable must be an array of field names`);
      }
    } else {
      // By default all string-like fields are searchable
      searchable = Object.keys(normalizedFields);
    }

    normalized[colName] = {
      count,
      fields: normalizedFields,
      relationships: normalizedRelationships,
      searchable
    };
  }

  // Cross-collection validation for relationships
  for (const [colName, colDef] of Object.entries(normalized)) {
    for (const [relKey, relDef] of Object.entries(colDef.relationships)) {
      if (!normalized[relDef.collection]) {
        throw new SchemaValidationError(
          `Relationship '${relKey}' in collection '${colName}' references non-existent collection '${relDef.collection}'`
        );
      }
    }
  }

  return normalized;
}

/**
 * Load schema from file or object.
 */
export function loadSchema(schemaInput, customGenerators = {}) {
  if (isObject(schemaInput)) {
    return validateSchema(schemaInput, customGenerators);
  }

  if (typeof schemaInput === 'string') {
    const filePath = path.isAbsolute(schemaInput) ? schemaInput : path.resolve(process.cwd(), schemaInput);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Schema file not found at: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const parsed = JSON.parse(content);
      return validateSchema(parsed, customGenerators);
    } catch (err) {
      if (err instanceof SchemaValidationError) throw err;
      throw new Error(`Failed to parse schema JSON file at ${filePath}: ${err.message}`);
    }
  }

  throw new SchemaValidationError('Schema must be a file path string or a JavaScript object');
}
