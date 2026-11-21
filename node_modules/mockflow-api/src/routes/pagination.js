export class PaginationValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaginationValidationError';
  }
}

/**
 * Validates pagination parameters and extracts page slice with metadata.
 */
export function applyPagination(items, pageQuery, limitQuery, options = {}) {
  const maxLimit = options.maxPaginationLimit || 100;
  const defaultLimit = options.defaultPaginationLimit || 10;

  let page = pageQuery !== undefined ? parseInt(pageQuery, 10) : 1;
  let limit = limitQuery !== undefined ? parseInt(limitQuery, 10) : defaultLimit;

  if (Number.isNaN(page) || page < 1) {
    throw new PaginationValidationError(`Invalid 'page' parameter: must be a positive integer`);
  }

  if (Number.isNaN(limit) || limit < 1) {
    throw new PaginationValidationError(`Invalid 'limit' parameter: must be a positive integer`);
  }

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);
  const startIndex = (page - 1) * limit;
  const paginatedData = items.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && page <= totalPages + 1
    }
  };
}
