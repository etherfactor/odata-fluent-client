import { ODataResponse } from "../odata.util";

export class ODataResponseImpl<TEntity> implements ODataResponse<TEntity> {

  private readonly stream: AsyncIterable<TEntity>;
  readonly count: Promise<number>;

  constructor(
    stream: AsyncIterable<TEntity>,
    count: Promise<number>
  ) {
    this.stream = stream;
    this.count = count;
  }

  [Symbol.asyncIterator](): AsyncIterator<TEntity, any, any> {
    return this.stream[Symbol.asyncIterator]();
  }

  async toArray(): Promise<TEntity[]> {
    const results: TEntity[] = [];
    for await (const result of this) {
      results.push(result);
    }

    return results;
  }
}
