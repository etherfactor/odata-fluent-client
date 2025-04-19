/**
 * Enables the decoupling of writing and reading iterable items by allowing one worker to push items while another retrieves
 * them. Once completed, it will no longer accept new items.
 */
export class AsyncQueue<TValue> {
  private queue: TValue[] = [];
  private promise!: Promise<TValue>;
  private resolver!: (value: TValue) => void;
  private ended = false;
  private error?: Error;

  constructor() {
    this.nextResolver();
  }

  /**
   * Adds an item to the end of the queue.
   * @param item The item to add.
   */
  push(item: TValue): void {
    if (this.ended)
      throw new Error("Queue has ended");

    this.queue.push(item);
    this.resolver(item);
    this.nextResolver();
  }

  /**
   * Marks the queue as complete and prevents adding more items.
   */
  complete(): void {
    this.ended = true;
    this.resolver(undefined!);
  }

  /**
   * Marks the queue as failed and prevents adding more items.
   * @param err 
   */
  fail(err: Error): void {
    this.ended = true;
    this.error = err;
    this.resolver(undefined!);
  }

  /**
   * Generates a new resolver, which waits for the next item.
   */
  private nextResolver(): void {
    this.promise = new Promise<TValue>((resolve, _) => {
      this.resolver = resolve;
    });
  }

  async *[Symbol.asyncIterator]() {
    //Iterate over the items currently in the queue
    for (let i = 0; i < this.queue.length + 1; i++) {
      //If we are trying to get an item past what is currently in the queue, and the queue is still active, we want to wait
      //until a new item is added
      if (i >= this.queue.length && !this.ended) {
        await this.promise;
      }

      //That promise resolves when a new item is added or the queue completes, so we need to check one more time if the
      //queue completed. If it encountered an error, we should throw it
      if (i >= this.queue.length && this.ended) {
        if (this.error)
          throw this.error;
        
        break;
      }

      //The queue is still active, so return the new item and continue to the next loop (where we may wait again)
      yield this.queue[i];
    }
  }
}
