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
    console.log("attempting to add", item);
    if (this.ended)
      throw new Error("Queue has ended");

    this.queue.push(item);
    this.resolver(item);
    this.nextResolver();

    console.log("successfully added", item);
  }

  complete(): void {
    console.log("completing queue");
    this.ended = true;
    this.resolver(undefined!);
  }

  fail(err: Error): void {
    console.log("failing queue");
    this.ended = true;
    this.error = err;
    this.resolver(undefined!);
    console.log("finished failing");
  }

  private nextResolver(): void {
    console.log("setting next promise");
    this.promise = new Promise<TValue>((resolve, _) => {
      this.resolver = resolve;
    });
  }

  async *[Symbol.asyncIterator]() {
    console.log("starting iterator");
    for (let i = 0; i < this.queue.length + 1; i++) {
      if (i >= this.queue.length && !this.ended) {
        console.log("queue is not finished, waiting for next item")
        await this.promise;
      }

      if (i >= this.queue.length && this.ended) {
        console.log("queue is finished, no more items");
        if (this.error)
          throw this.error;
        
        break;
      }

      console.log("yielding next item in queue");
      yield this.queue[i];
    }
  }
}
