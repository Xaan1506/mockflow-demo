
import { Router } from 'express';
import { applyFiltering } from './filtering.js';
import { applySorting } from './sorting.js';
import { applySearching } from './searching.js';
import { applyPagination } from './pagination.js';
import { ApiError } from '../middleware/error-handler.js';
import { isObject } from '../utils/validators.js';

/**
 * Creates Express Router with full CRUD, filtering, sorting, searching,
 * pagination, and relationship expansion for a given collection.
 */
export function createCrudRouter({
  collectionName,
  schemaDef,
  normalizedSchema,
  database,
  config
}) {
  const router = Router();
  const searchableFields = schemaDef.searchable || [];
  const relationships = schemaDef.relationships || {};

  /**
   * Expand direct and reverse relationships.
   * Examples:
   * ?include=user
   * ?include=posts
   */
  function expandRecordRelationships(record, includes) {
    if (!includes || includes.length === 0) return record;

    const expanded = { ...record };

    for (const inc of includes) {
      const requested = inc.toLowerCase();

      // Direct relationships: posts -> user
      for (const [relKey, relDef] of Object.entries(relationships)) {
        const targetCol = relDef.collection;

        const singularName = targetCol.endsWith('s')
          ? targetCol.slice(0, -1)
          : targetCol;

        const matchesName =
          requested === targetCol.toLowerCase() ||
          requested === singularName.toLowerCase() ||
          requested === relKey.toLowerCase();

        if (!matchesName) continue;

        if (
          relDef.type === 'many-to-one' ||
          relDef.type === 'one-to-one'
        ) {
          const foreignId = record[relKey];

          if (foreignId !== undefined && foreignId !== null) {
            expanded[singularName] = database.findById(
              targetCol,
              foreignId
            );
          }
        }
      }

      // Reverse relationships: users -> posts
      for (const [otherCol, otherDef] of Object.entries(
        normalizedSchema || {}
      )) {
        if (otherCol === collectionName) continue;

        const otherRelationships = otherDef.relationships || {};

        for (const [foreignKey, relDef] of Object.entries(
          otherRelationships
        )) {
          if (
            relDef.collection !== collectionName ||
            !['many-to-one', 'one-to-one'].includes(relDef.type)
          ) {
            continue;
          }

          const singularName = otherCol.endsWith('s')
            ? otherCol.slice(0, -1)
            : otherCol;

          const matchesName =
            requested === otherCol.toLowerCase() ||
            requested === singularName.toLowerCase();

          if (!matchesName) continue;

          const related = database.findAll(otherCol).filter(item =>
            String(item[foreignKey]) === String(record.id)
          );

          expanded[otherCol] = related;
        }
      }
    }

    return expanded;
  }

  // GET /api/<collection>
  router.get('/', (req, res, next) => {
    try {
      let items = database.findAll(collectionName);

      // Search
      if (req.query.search) {
        items = applySearching(
          items,
          req.query.search,
          searchableFields
        );
      }

      // Filter
      items = applyFiltering(items, req.query);

      // Sort
      if (req.query.sort) {
        items = applySorting(
          items,
          req.query.sort,
          req.query.order
        );
      }

      // Relationship expansion
      const includes = req.query.include
        ? String(req.query.include)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

      if (includes.length > 0) {
        items = items.map(item =>
          expandRecordRelationships(item, includes)
        );
      }

      // Pagination
      const result = applyPagination(
        items,
        req.query.page,
        req.query.limit,
        config
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/<collection>/:id
  router.get('/:id', (req, res, next) => {
    try {
      const record = database.findById(
        collectionName,
        req.params.id
      );

      if (!record) {
        throw new ApiError(
          `Record with ID '${req.params.id}' not found in '${collectionName}'`,
          404,
          'RESOURCE_NOT_FOUND'
        );
      }

      const includes = req.query.include
        ? String(req.query.include)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

      const result = includes.length > 0
        ? expandRecordRelationships(record, includes)
        : record;

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/<collection>
  router.post('/', (req, res, next) => {
    try {
      if (!isObject(req.body)) {
        throw new ApiError(
          'Request body must be a valid JSON object',
          400,
          'INVALID_BODY'
        );
      }

      const created = database.insert(collectionName, req.body);
      res.status(201).json(created);
    } catch (err) {
      if (err.code === 'DUPLICATE_ID') {
        return next(
          new ApiError(err.message, 400, 'DUPLICATE_ID')
        );
      }

      next(err);
    }
  });

  // PUT /api/<collection>/:id
  router.put('/:id', (req, res, next) => {
    try {
      if (!isObject(req.body)) {
        throw new ApiError(
          'Request body must be a valid JSON object',
          400,
          'INVALID_BODY'
        );
      }

      const updated = database.update(
        collectionName,
        req.params.id,
        req.body,
        false
      );

      if (!updated) {
        throw new ApiError(
          `Record with ID '${req.params.id}' not found in '${collectionName}'`,
          404,
          'RESOURCE_NOT_FOUND'
        );
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/<collection>/:id
  router.patch('/:id', (req, res, next) => {
    try {
      if (!isObject(req.body)) {
        throw new ApiError(
          'Request body must be a valid JSON object',
          400,
          'INVALID_BODY'
        );
      }

      const updated = database.update(
        collectionName,
        req.params.id,
        req.body,
        true
      );

      if (!updated) {
        throw new ApiError(
          `Record with ID '${req.params.id}' not found in '${collectionName}'`,
          404,
          'RESOURCE_NOT_FOUND'
        );
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/<collection>/:id
  router.delete('/:id', (req, res, next) => {
    try {
      const deleted = database.delete(
        collectionName,
        req.params.id
      );

      if (!deleted) {
        throw new ApiError(
          `Record with ID '${req.params.id}' not found in '${collectionName}'`,
          404,
          'RESOURCE_NOT_FOUND'
        );
      }

      res.status(200).json({
        success: true,
        message: `Record '${req.params.id}' deleted successfully from '${collectionName}'`,
        deletedId: req.params.id
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
