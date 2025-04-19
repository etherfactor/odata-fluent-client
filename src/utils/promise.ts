/**
 * Converts a non-promise value into a promise.
 * @param value The value.
 * @returns The value as a promise.
 */
export async function toPromise<TValue>(value: TValue): Promise<TValue> {
  return value;
}

/**
 * Converts a non-iterable array into an iterable.
 * @param value The array.
 * @returns The array as an iterable.
 */
export function toIterable<TValue>(value: TValue[]): AsyncIterable<TValue> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const val of value) {
        yield val;
      }
    }
  };
}
