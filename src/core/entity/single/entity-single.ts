import { SafeAny, SingleType } from "../../../utils/types";
import { Expand } from "../../parameters/expand";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntityResponse } from "../../response/entity-response";
import { EntityExpand, EntityExpandImpl } from "../expand/entity-expand";
import { EntitySingleWorker } from "./entity-single-worker";
import { EntitySingleWorkerImpl } from "./entity-single-worker.impl";

/**
 * A builder for query options against a single entity.
 */
export interface EntitySingle<TEntity> {
  /**
   * Executes the specified query options against the single entity.
   */
  execute(): EntityResponse<TEntity>;
  /**
   * Includes an associated entity or entities.
   * @param property The navigation property.
   * @param builder The expansion builder.
   */
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<SingleType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySingle<TEntity>;
  /**
   * Selects a subset of properties to be returned on the entity or entities.
   * @param properties The properties to be returned.
   */
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>>;
  /**
   * Gets the options produced in this builder.
   */
  getOptions(): ODataOptions;
}

/**
 * The entity single implementation. Relies on an underlying worker to do the actual work; as a result, there is only one
 * implementation. This is ideal given the complexity.
 */
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

  /**
   * These things are immutable, so calling any method returns a new instance with the new options.
   */
  protected new<TNewEntity = TEntity>(worker: EntitySingleWorker<TNewEntity>, options?: ODataOptions): EntitySingleImpl<TNewEntity> {
    return new EntitySingleImpl(this.worker as unknown as EntitySingleWorkerImpl<TNewEntity>, options);
  }

  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(property: TExpanded, builder?: (expand: EntityExpand<SingleType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySingle<TEntity> {
    let expander: SafeAny = new EntityExpandImpl<SingleType<TEntity[TExpanded]>>(property);
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
