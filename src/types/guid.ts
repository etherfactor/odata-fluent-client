import { v4 as uuidv4, validate } from 'uuid';

/**
 * A string in the form of a guid.
 */
export type Guid = string & { __guidTag: true };

/**
 * Generates a random (v4) {@link Guid}.
 * @returns 
 */
export function generateGuid(): Guid {
  return uuidv4() as Guid;
}

/**
 * Checks if a value is a {@link Guid}.
 * @param value The value to test.
 * @returns Whether the value is a guid.
 */
export function isGuid(value: unknown): value is Guid {
  if (typeof value === 'string') {
    return validate(value);
  }

  return false;
}

/**
 * Parses the provided value as a {@link Guid}. Throws an error otherwise.
 * @param value The value to parse.
 * @returns The guid value, or an error.
 */
export function parseGuid(value: unknown): Guid {
  if (isGuid(value)) {
    return value;
  }

  throw new Error(`Value ${value} is not a valid guid.`);
}
