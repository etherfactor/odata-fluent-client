import { PrefixGenerator } from "../../../utils/prefix-generator";
import { InferArrayType, SafeAny } from "../../../utils/types";
import { Value } from "../../../values/base";
import { Count } from "../../parameters/count";
import { Expand } from "../../parameters/expand";
import { Filter } from "../../parameters/filter";
import { ODataOptions } from "../../parameters/odata-options";
import { OrderBy, SortDirection } from "../../parameters/orderby";
import { Select } from "../../parameters/select";
import { Skip } from "../../parameters/skip";
import { Top } from "../../parameters/top";
import { EntitySetResponse } from "../../response/entity-response";
import { EntityAccessor, EntityAccessorImpl } from "../expand/entity-accessor";
import { EntityExpand, EntityExpandImpl } from "../expand/entity-expand";
import { EntitySetWorker } from "./entity-set-worker";

/**
 * A builder for query options against a collection of entities.
 */
export interface EntitySet<TEntity> {
  /**
   * Counts the entities.
   */
  count(): EntitySet<TEntity>;
  /**
   * Executes the specified query options against the collection of entities.
   */
  execute(): EntitySetResponse<TEntity>;
  /**
   * Includes an associated entity or entities.
   * @param property The navigation property.
   * @param builder The expansion builder.
   */
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySet<TEntity>;
  /**
   * Filters the returned entities to the ones matching the provided condition.
   * @param builder The filter builder.
   */
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity>;
  /**
   * Sorts the returned entities.
   * @param property The property by which to sort.
   * @param direction The direction in which to sort.
   */
  orderBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntitySet<TEntity>;
  /**
   * Selects a subset of properties to be returned on the entity or entities.
   * @param properties The properties to be returned.
   */
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>>;
  /**
   * Skips over the specified number of entities before returning any.
   * @param count The number of entities to skip.
   */
  skip(count: number): EntitySet<TEntity>;
  /**
   * Returns up to the specified number of entities.
   * @param count The number of entities to return.
   */
  top(count: number): EntitySet<TEntity>;
  /**
   * Gets the options produced in this builder.
   */
  getOptions(): ODataOptions;
}

/**
 * A builder for query options against a collection of entities, which has sorting applied.
 */
export interface OrderedEntitySet<TEntity> extends EntitySet<TEntity> {
  /**
   * Continues sorting by a second property.
   * @param property The property by which to sort.
   * @param direction The direction in which to sort.
   */
  thenBy(property: keyof TEntity & string, direction?: SortDirection): EntitySet<TEntity>;
}

/**
 * The entity set implementation. Relies on an underlying worker to do the actual work; as a result, there is only one
 * implementation. This is ideal given the complexity.
 */
export class EntitySetImpl<TEntity> implements EntitySet<TEntity>, OrderedEntitySet<TEntity> {

  protected readonly worker: EntitySetWorker<TEntity>;
  protected readonly countValue?: Count;
  protected readonly expandValue?: Expand[];
  protected readonly filterValue?: Filter[];
  protected readonly orderByValue?: OrderBy[];
  protected readonly selectValue?: Select[];
  protected readonly skipValue?: Skip;
  protected readonly topValue?: Top;

  constructor(
    worker: EntitySetWorker<TEntity>,
    options?: ODataOptions,
  ) {
    this.worker = worker;
    this.countValue = options?.count;
    this.expandValue = options?.expand;
    this.filterValue = options?.filter;
    this.orderByValue = options?.orderBy;
    this.selectValue = options?.select;
    this.skipValue = options?.skip;
    this.topValue = options?.top;
  }

  /**
   * These things are immutable, so calling any method returns a new instance with the new options.
   */
  protected new<TNewEntity = TEntity>(worker: EntitySetWorker<TNewEntity>, options?: ODataOptions): EntitySetImpl<TNewEntity> {
    return new EntitySetImpl(this.worker as unknown as EntitySetImpl<TNewEntity>, options);
  }

  count(): EntitySet<TEntity> {
    const options = this.getOptions();
    options.count = true;

    return this.new<TEntity>(this.worker, options);
  }

  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySet<TEntity> {
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

  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity> {
    const generator = new PrefixGenerator;
    const accessor = new EntityAccessorImpl<TEntity>(generator);

    const filter = builder(accessor);
    const newFilters = [...(this.filterValue ?? []), filter];

    const options = this.getOptions();
    options.filter = newFilters;

    return this.new<TEntity>(this.worker, options);
  }

  orderBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntitySet<TEntity> {
    const options = this.getOptions();
    options.orderBy = [{ property, direction: direction ?? 'asc' }];

    return this.new<TEntity>(this.worker, options);
  }

  thenBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntitySet<TEntity> {
    const options = this.getOptions();
    options.orderBy!.push({ property, direction: direction ?? 'asc' });

    return this.new<TEntity>(this.worker, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    //options.select ??= [];
    //options.select = [...options.select, ...properties];

    //Using this method as calling .select() mutates the entity and reduces the available properties. If we add subsequent
    //selections to the existing list, the returned API model and the expected API model will not match. We can improve this
    //if we separately track the original entity and the selected projection, at which point we can use the method above
    options.select = [...properties];

    return this.new<Pick<TEntity, TSelected>>(this.worker, options);
  }

  skip(count: number): EntitySet<TEntity> {
    const options = this.getOptions();
    options.skip = count;

    return this.new(this.worker, options);
  }

  top(count: number): EntitySet<TEntity> {
    const options = this.getOptions();
    options.top = count;

    return this.new<TEntity>(this.worker, options);
  }

  getOptions(): ODataOptions {
    return {
      count: this.countValue,
      expand: this.expandValue,
      filter: this.filterValue,
      orderBy: this.orderByValue,
      select: this.selectValue,
      skip: this.skipValue,
      top: this.topValue,
    };
  }

  execute(): EntitySetResponse<TEntity> {
    return this.worker.execute(this.getOptions());
  }
}
