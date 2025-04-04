import { InferArrayType, SafeAny } from "../../../utils/types";
import { Expand } from "../../parameters/expand";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntityExpand, EntityExpandImpl } from "../expand/entity-expand";
import { EntityResponse } from "../response/entity-response";
import { EntitySingleWorker } from "./entity-single-worker";
import { EntitySingleWorkerImpl } from "./entity-single-worker.impl";

export interface EntitySingle<TEntity> {
  execute(): EntityResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySingle<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>>;
  getOptions(): ODataOptions;
}

export class EntitySingleImpl<TEntity> implements EntitySingle<TEntity> {

  protected readonly worker: EntitySingleWorker<TEntity>;
  private readonly expandValue?: Expand[];
  private readonly selectValue?: Select[];

  constructor(
    worker: EntitySingleWorker<TEntity>,
    options?: ODataOptions,
  ) {
    this.worker = worker;
    this.expandValue = options?.expand;
    this.selectValue = options?.select;
  }

  protected new<TNewEntity = TEntity>(worker: EntitySingleWorker<TNewEntity>, options?: ODataOptions): EntitySingleImpl<TNewEntity> {
    return new EntitySingleImpl(this.worker as unknown as EntitySingleWorkerImpl<TNewEntity>, options);
  }

  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySingle<TEntity> {
    let expander: SafeAny = new EntityExpandImpl<InferArrayType<TEntity[TExpanded]>>(property);
    if (builder) {
      expander = builder(expander);
    }

    const expand: Expand = { property, value: expander };
    const newExpand = [...(this.expandValue ?? []), expand];

    const options = this.getOptions();
    options.expand = newExpand;

    return this.new<TEntity>(this.worker, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    //options.select ??= [];
    //options.select = [...options.select, ...properties];

    //Using this method as calling .select() mutates the entity and reduces the available properties. If we add subsequent
    //selections to the existing list, the returned API model and the expected API model will not match. We can improve this
    //if we separately track the original entity and the selected projection, at which point we can use the method above
    options.select = [...properties];

    return this.new<Pick<TEntity, TSelected>>(this.worker, options);
  }

  getOptions(): ODataOptions {
    return {
      expand: this.expandValue,
      select: this.selectValue,
    };
  }

  execute(): EntityResponse<TEntity> {
    return this.worker.execute(this.getOptions());
  }
}
