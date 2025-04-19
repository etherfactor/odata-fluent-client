import { ODataOptions } from "../../parameters/odata-options";
import { EntitySetResponse } from "../../response/entity-response";

/**
 * Performs underlying work for an entity set.
 */
export interface EntitySetWorker<TEntity> {
  /**
   * Executes the specified options and returns a response.
   * @param options The options to execute.
   */
  execute(options: ODataOptions): EntitySetResponse<TEntity>;
}
