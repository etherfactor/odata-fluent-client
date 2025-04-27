import { toIterable, toPromise } from "../../src/utils/promise";

describe('toPromise', () => {
  it('should create a promise of a value', async () => {
    const value = 3;
    const promise = toPromise(3);

    const awaitValue = await promise;

    expect(awaitValue).toBe(value);
  });
});

describe('toIterable', () => {
  it('should create an iterable of an array', async () => {
    const values = [3, 4, 5];
    const iterable = toIterable(values);

    const awaitValues: number[] = [];
    for await (const value of iterable) {
      awaitValues.push(value);
    }

    expect(awaitValues).toEqual(values);
  });
});
