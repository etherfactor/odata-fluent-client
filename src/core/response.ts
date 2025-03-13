import { ODataResponse } from "../odata.util";

class Implementation<TEntity> implements ODataResponse<TEntity> {

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

export const ɵODataResponse = {
  Implementation,
};
