import { ODataOptions } from "../../parameters/odata-options";
import { EntityResponse } from "../../response/entity-response";

/**
 * Performs underlying work for an entity single.
 */
export interface EntitySingleWorker<TEntity> {
  /**
   * Executes the specified options and returns a response.
   * @param options The options to execute.
   */
  execute(options: ODataOptions): EntityResponse<TEntity>;
}
