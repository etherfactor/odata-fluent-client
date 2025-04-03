import { ODataOptions } from "../../parameters/odata-options";
import { EntitySetResponse } from "../response/entity-response";

export interface EntitySetWorker<TEntity> {
  execute(options: ODataOptions): EntitySetResponse<TEntity>;
}
