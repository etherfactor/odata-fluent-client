import { InferArrayType } from "../../utils/types";
import { ODataOptions } from "../params";
import { EntityExpand } from "./entity-expand";
import { EntityResponse } from "./entity-response";

export interface EntitySingle<TEntity> {
  execute(): EntityResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySingle<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>>;
  getOptions(): ODataOptions;
}

export interface EntitySingleWorker<TEntity> {
  execute(options: ODataOptions): EntityResponse<TEntity>;
}
