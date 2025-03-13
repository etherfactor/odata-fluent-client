export async function toPromise<TValue>(value: TValue): Promise<TValue> {
  return value;
}

export function toIterable<TValue>(value: TValue[]): AsyncIterable<TValue> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const val of value) {
        yield val;
      }
    }
  };
}
