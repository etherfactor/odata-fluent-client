/**
 * Represents any array.
 */
export type AnyArray = Array<SafeAny>;

/**
 * Extracts the type from an array, otherwise returns the initial type. Also strips out null and undefined in the case of union types.
 */
export type SingleType<TValue> = Exclude<TValue extends (infer UValue)[] ? UValue : TValue, null | undefined>;

/**
 * Returns the initial type, only if it is an object or array.
 */
export type IsObjectOrArray<TValue> = TValue extends object ? (TValue extends AnyArray ? (TValue[number] extends object ? TValue : never) : TValue): never;

/**
 * Since eslint does not like 'any' (which is valid), this just avoids having to frequently disable the linting rule.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
