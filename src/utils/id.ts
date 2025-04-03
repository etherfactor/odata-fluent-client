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
    return id.toString() ?? "";
  }
}
