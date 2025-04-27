import { AsyncQueue } from "../../src/utils/async-queue";

describe('AsyncQueue', () => {
  it('should yield items pushed before iteration and completes', async () => {
    const queue = new AsyncQueue<number>();
    queue.push(1);
    queue.push(2);
    queue.complete();

    const result: number[] = [];
    for await (const item of queue) {
      result.push(item);
    }

    expect(result).toEqual([1, 2]);
  });

  it('should yield items pushed during iteration', async () => {
    const queue = new AsyncQueue<number>();
    const result: number[] = [];

    //Start iteration in the background
    const iterPromise = (async () => {
      for await (const item of queue) {
        result.push(item);
      }
    })();

    //Simulate asynchronous pushes
    setTimeout(() => {
      queue.push(10);
    }, 20);

    setTimeout(() => {
      queue.push(20);
      queue.complete();
    }, 40);

    await iterPromise;
    expect(result).toEqual([10, 20]);
  });

  it('should complete iteration when complete is called', async () => {
    const queue = new AsyncQueue<string>();
    queue.push('first');
    queue.complete();

    const result: string[] = [];
    for await (const item of queue) {
      result.push(item);
    }
    expect(result).toEqual(['first']);
  });

  it('should iterate over an empty queue when complete is called without pushes', async () => {
    const queue = new AsyncQueue<number>();
    queue.complete();

    const result: number[] = [];
    for await (const item of queue) {
      result.push(item);
    }
    expect(result).toEqual([]);
  });

  it('should not yield new items after fail is called', async () => {
    const queue = new AsyncQueue<number>();

    //Push an item so that the iterator enters the loop and awaits a new value
    queue.push(1);
    const iterator = queue[Symbol.asyncIterator]();

    //Get the first item
    const first = await iterator.next();
    expect(first.value).toBe(1);

    //Now, while the iterator is waiting for the next item, call fail()
    queue.fail(new Error('Queue failed'));

    //Because fail() does not resolve the pending promise, we expect that a call to next()
    //does not resolve within our timeout
    let error: unknown;
    try {
      await iterator.next()
    } catch (err) {
      error = err;
    }

    expect(error).toBeTruthy();
  });

  it('should throw error when new item is pushed after complete', () => {
    const queue = new AsyncQueue<number>();

    queue.complete();

    expect(() => { queue.push(1) }).toThrow();
  });

  it('should throw error when new item is pushed after complete', () => {
    const queue = new AsyncQueue<number>();

    queue.fail(new Error('Queue failed'));

    expect(() => { queue.push(1) }).toThrow();
  });
});
