import { InferArrayType } from "../../utils/types";
import { Value } from "../../values/base";
import { Count, Expand, expandToString, Filter, filterToString, ODataOptions, OrderBy, orderByToString, Select, selectToString, Skip, skipToString, SortDirection, Top, topToString } from "../params";
import { PrefixGenerator } from "../prefix-generator";
import { EntityAccessor, EntityAccessorImpl } from "./entity-accessor";

export interface EntityExpand<TEntity> {
  count(): EntityExpand<TEntity>;
  expand<TExpanded extends keyof TEntity & string>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntityExpand<TEntity>;
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntityExpand<TEntity>;
  orderBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntityExpand<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntityExpand<Pick<TEntity, TSelected>>;
  skip(count: number): EntityExpand<TEntity>;
  top(count: number): EntityExpand<TEntity>;
  toString(): string;
  getOptions(): ODataOptions;
}

export interface OrderedEntityExpand<TEntity> extends EntityExpand<TEntity> {
  thenBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntityExpand<TEntity>;
}

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

  expand<TExpanded extends keyof TEntity & string>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntityExpand<TEntity> {
    let expander: EntityExpand<InferArrayType<TEntity[TExpanded]>> = new EntityExpandImpl<InferArrayType<TEntity[TExpanded]>>(property);
    if (builder) {
      expander = builder(expander);
    }

    const expand: Expand = { property, value: expander };
    const newExpand = [...(this.expandValue ?? []), expand];

    const options = this.getOptions();
    options.expand = newExpand;

    return new EntityExpandImpl<TEntity>(property, options);
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
    options.orderBy?.push({ property, direction: direction ?? 'asc' });

    return new EntityExpandImpl<TEntity>(this.property, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntityExpand<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    options.select ??= [];
    options.select = [...options.select, ...properties];

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
