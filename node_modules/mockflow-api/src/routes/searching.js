/**
 * Case-insensitive partial matching search across searchable fields.
 */
export function applySearching(items, searchTerm, searchableFields = []) {
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return items;
  }

  const query = searchTerm.trim().toLowerCase();

  return items.filter(item => {
    const fieldsToCheck = searchableFields.length > 0 ? searchableFields : Object.keys(item);

    return fieldsToCheck.some(field => {
      if (!Object.prototype.hasOwnProperty.call(item, field)) return false;
      const val = item[field];
      if (val === null || val === undefined) return false;

      return String(val).toLowerCase().includes(query);
    });
  });
}
