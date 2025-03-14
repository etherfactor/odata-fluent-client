export type EntityResponse<TEntity> = {
  data: Promise<TEntity>;
}

export type EntitySetResponse<TEntity> = {
  count: Promise<number>;
  data: Promise<TEntity[]>;
  iterator: AsyncIterable<TEntity>;
}
