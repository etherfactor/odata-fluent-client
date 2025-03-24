export class AsyncQueue<TValue> {
  private queue: TValue[] = [];
  private promise!: Promise<TValue>;
  private resolver!: (value: TValue) => void;
  private ended = false;
  private error?: Error;

  constructor() {
    this.nextResolver();
  }

  push(item: TValue): void {
    if (this.ended)
      throw new Error("Queue has ended");

    this.queue.push(item);
    this.resolver(item);
    this.nextResolver();
  }

  complete(): void {
    this.ended = true;
    this.resolver(undefined!);
  }

  fail(err: Error): void {
    this.ended = true;
    this.error = err;
    this.resolver(undefined!);
  }

  private nextResolver(): void {
    this.promise = new Promise<TValue>((resolve, _) => {
      this.resolver = resolve;
    });
  }

  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < this.queue.length + 1; i++) {
      if (i >= this.queue.length && !this.ended) {
        await this.promise;
      }

      if (i >= this.queue.length && this.ended) {
        if (this.error)
          throw this.error;
        
        break;
      }

      yield this.queue[i];
    }
  }
}
