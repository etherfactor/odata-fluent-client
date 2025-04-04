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
import { EntityAccessor, EntityAccessorImpl } from "../expand/entity-accessor";
import { EntityExpand, EntityExpandImpl } from "../expand/entity-expand";
import { EntitySetResponse } from "../response/entity-response";
import { EntitySetWorker } from "./entity-set-worker";

export interface EntitySet<TEntity> {
  count(): EntitySet<TEntity>;
  execute(): EntitySetResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySet<TEntity>;
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity>;
  orderBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntitySet<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>>;
  skip(count: number): EntitySet<TEntity>;
  top(count: number): EntitySet<TEntity>;
  getOptions(): ODataOptions;
}

export interface OrderedEntitySet<TEntity> extends EntitySet<TEntity> {
  thenBy(property: keyof TEntity & string, direction?: SortDirection): EntitySet<TEntity>;
}

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
