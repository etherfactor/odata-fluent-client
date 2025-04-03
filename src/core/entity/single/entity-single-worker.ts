import { ODataOptions } from "../../parameters/odata-options";
import { EntityResponse } from "../response/entity-response";

export interface EntitySingleWorker<TEntity> {
  execute(options: ODataOptions): EntityResponse<TEntity>;
}
