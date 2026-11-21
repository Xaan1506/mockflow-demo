/**
 * Apply sorting to an array of items.
 * Supports:
 * ?sort=price&order=asc
 * ?sort=price,name&order=desc,asc
 */
export function applySorting(items, sortParam, orderParam = 'asc') {
  if (!sortParam) return items;

  const sortFields = String(sortParam).split(',').map(s => s.trim()).filter(Boolean);
  const orderDirections = String(orderParam).split(',').map(s => s.trim().toLowerCase());

  if (sortFields.length === 0) return items;

  return [...items].sort((a, b) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      // Guard against prototype access
      if (!Object.prototype.hasOwnProperty.call(a, field) && !Object.prototype.hasOwnProperty.call(b, field)) {
        continue;
      }

      const dir = (orderDirections[i] || orderDirections[0] || 'asc') === 'desc' ? -1 : 1;
      const valA = a[field];
      const valB = b[field];

      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return cmp * dir;
      } else if (valA < valB) {
        return -1 * dir;
      } else if (valA > valB) {
        return 1 * dir;
      }
    }
    return 0;
  });
}
