/**
 * Converts an id or set of its into a string. Only really used for mocks, so we can use composite keys.
 * @param id The id to convert.
 * @returns The id as a pipe-delimited string.
 */
export function toIdString(id: unknown | unknown[]) {
  if (id === undefined || id === null) {
    throw new Error("Id must be non-null");
  } else if (Array.isArray(id)) {
    return id.map(item => {
      if (!item)
        throw new Error("Id must be non-null");

      return item.toString();
    }).join("|");
  } else {
    return id.toString();
  }
}
