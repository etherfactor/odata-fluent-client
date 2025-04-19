import { PrefixGenerator } from "../../../utils/prefix-generator";
import { InferArrayType, SafeAny } from "../../../utils/types";
import { Value } from "../../../values/base";
import { Count } from "../../parameters/count";
import { Expand, expandToString } from "../../parameters/expand";
import { Filter, filterToString } from "../../parameters/filter";
import { ODataOptions } from "../../parameters/odata-options";
import { OrderBy, orderByToString, SortDirection } from "../../parameters/orderby";
import { Select, selectToString } from "../../parameters/select";
import { Skip, skipToString } from "../../parameters/skip";
import { Top, topToString } from "../../parameters/top";
import { EntityAccessor, EntityAccessorImpl } from "./entity-accessor";

/**
 * Configures an entity expansion.
 */
export interface EntityExpand<TEntity> {
  /**
   * Counts the entities.
   */
  count(): EntityExpand<TEntity>;
  /**
   * Includes an associated entity or entities.
   * @param property The navigation property.
   * @param builder The expansion builder.
   */
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntityExpand<TEntity>;
  /**
   * Filters the returned entities to the ones matching the provided condition.
   * @param builder The filter builder.
   */
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntityExpand<TEntity>;
  /**
   * Sorts the returned entities.
   * @param property The property by which to sort.
   * @param direction The direction in which to sort.
   */
  orderBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntityExpand<TEntity>;
  /**
   * Selects a subset of properties to be returned on the entity or entities.
   * @param properties The properties to be returned.
   */
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntityExpand<Pick<TEntity, TSelected>>;
  /**
   * Skips over the specified number of entities before returning any.
   * @param count The number of entities to skip.
   */
  skip(count: number): EntityExpand<TEntity>;
  /**
   * Returns up to the specified number of entities.
   * @param count The number of entities to return.
   */
  top(count: number): EntityExpand<TEntity>;
  /**
   * Converts this builder into a string that could be used in $expand.
   */
  toString(): string;
  /**
   * Gets the options produced in this builder.
   */
  getOptions(): ODataOptions;
}

/**
 * Configures an entity expansion, which has sorting applied.
 */
export interface OrderedEntityExpand<TEntity> extends EntityExpand<TEntity> {
  /**
   * Continues sorting by a second property.
   * @param property The property by which to sort.
   * @param direction The direction in which to sort.
   */
  thenBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntityExpand<TEntity>;
}

/**
 * The entity expand implementation. This really is just a fancy helper, so it doesn't care if the actual client is physical
 * or a mock.
 */
export class EntityExpandImpl<TEntity> implements EntityExpand<TEntity>, OrderedEntityExpand<TEntity> {

  private readonly property: string;

  private readonly countValue?: Count;
  private readonly expandValue?: Expand[];
  private readonly filterValue?: Filter[];
  private readonly orderByValue?: OrderBy[];
  private readonly selectValue?: Select[];
  private readonly skipValue?: Skip;
  private readonly topValue?: Top;

  constructor(property: string, options?: ODataOptions) {
    this.property = property;

    this.countValue = options?.count;
    this.expandValue = options?.expand;
    this.filterValue = options?.filter;
    this.orderByValue = options?.orderBy;
    this.selectValue = options?.select;
    this.skipValue = options?.skip;
    this.topValue = options?.top;
  }

  count(): EntityExpand<TEntity> {
    const options = this.getOptions();
    options.count = true;

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntityExpand<TEntity> {
    let expander: SafeAny = new EntityExpandImpl<InferArrayType<TEntity[TExpanded]>>(property);
    if (builder) {
      expander = builder(expander);
    }

    const expand: Expand = { property, value: expander };
    const newExpand = [...(this.expandValue ?? []), expand];

    const options = this.getOptions();
    options.expand = newExpand;

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntityExpand<TEntity> {
    const generator = new PrefixGenerator();
    const accessor = new EntityAccessorImpl<TEntity>(generator);

    const filter = builder(accessor);
    const newFilters = [...(this.filterValue ?? []), filter];

    const options = this.getOptions();
    options.filter = newFilters;

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  orderBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntityExpand<TEntity> {
    const options = this.getOptions();
    options.orderBy = [{ property, direction: direction ?? 'asc' }];

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  thenBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntityExpand<TEntity> {
    const options = this.getOptions();
    options.orderBy!.push({ property, direction: direction ?? 'asc' });

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntityExpand<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    options.select ??= [];
    options.select = [...properties];

    return new EntityExpandImpl<Pick<TEntity, TSelected>>(this.property, options);
  }

  skip(count: number): EntityExpand<TEntity> {
    const options = this.getOptions();
    options.skip = count;

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  top(count: number): EntityExpand<TEntity> {
    const options = this.getOptions();
    options.top = count;

    return new EntityExpandImpl<TEntity>(this.property, options);
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

  toString(): string {
    let result = this.property;
    let extra = '';

    if (this.countValue) {
      extra += `; $count=true`;
    }

    if (this.filterValue) {
      extra += `; $filter=${filterToString(this.filterValue)}`;
    }

    if (this.orderByValue) {
      extra += `; $orderby=${orderByToString(this.orderByValue)}`;
    }

    if (this.selectValue) {
      extra += `; $select=${selectToString(this.selectValue)}`;
    }

    if (this.skipValue) {
      extra += `; $skip=${skipToString(this.skipValue)}`;
    }

    if (this.topValue) {
      extra += `; $top=${topToString(this.topValue)}`;
    }

    if (this.expandValue) {
      extra += `; $expand=${expandToString(this.expandValue)}`;
    }

    extra = '(' + extra.substring(2) + ')';

    if (extra !== '()') {
      result += extra;
    }

    return result;
  }
}
