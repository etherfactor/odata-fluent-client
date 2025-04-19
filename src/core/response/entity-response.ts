/**
 * A response containing a single entity.
 */
export interface EntityResponse<TEntity> extends BasicResponse {
  /**
   * Contains the returned entity.
   */
  data: Promise<TEntity>;
}

/**
 * A response containing a set of entities.
 */
export interface EntitySetResponse<TEntity> extends BasicResponse {
  /**
   * If included in the request, the count of entities matching the provided filter.
   */
  count: Promise<number>;
  /**
   * The returned entities. Waits for the entire request to complete before returning any.
   */
  data: Promise<TEntity[]>;
  /**
   * A stream of entities. Returns each entity as soon as it becomes available from the server.
   */
  iterator: AsyncIterable<TEntity>;
}

/**
 * A response for navigation actions.
 */
export interface EntityNavigationResponse extends BasicResponse {
  /**
   * Allows awaiting the response to capture any exceptions. Otherwise, it may be worth using {@link result}.
   */
  response: Promise<void>;
}

/**
 * A base for other responses.
 */
export interface BasicResponse {
  /**
   * Indicates whether or not the entire request was successful. Note that awaiting this on a streaming response will wait
   * for the ENTIRE request to finish, which will likely be longer than waiting for individual items.
   */
  result: Promise<boolean>;
}
