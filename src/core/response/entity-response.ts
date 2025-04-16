export interface EntityResponse<TEntity> extends BasicResponse {
  data: Promise<TEntity>;
}

export interface EntitySetResponse<TEntity> extends BasicResponse {
  count: Promise<number>;
  data: Promise<TEntity[]>;
  iterator: AsyncIterable<TEntity>;
}

export interface EntityNavigationResponse extends BasicResponse {
  response: Promise<void>;
}

export interface BasicResponse {
  result: Promise<boolean>;
}
