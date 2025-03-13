import { Guid } from "./types/guid";
import { AnyArray, InferArrayType } from "./utils/types";
import { EqualsComparisonValue, GreaterThanComparisonValue, GreaterThanOrEqualsComparisonValue, LessThanComparisonValue, LessThanOrEqualsComparisonValue, NotEqualsComparisonValue } from "./values/comparison";
import { BooleanConstantValue, DateConstantValue, DateTimeConstantValue, GuidConstantValue, IntegerConstantValue, NullConstantValue, StringConstantValue, TimeConstantValue } from "./values/constant";
import { CeilingFunctionValue, ConcatFunctionValue, ContainsFunctionValue, EndsWithFunctionValue, FloorFunctionValue, IndexOfFunctionValue, LengthFunctionValue, RoundFunctionValue, StartsWithFunctionValue, SubstringFunctionValue, ToLowerFunctionValue, ToUpperFunctionValue, TrimFunctionValue } from "./values/function";
import { AndLogicalValue, NotLogicalValue, OrLogicalValue } from "./values/logical";
import { AddOperatorValue, DivideOperatorValue, ModuloOperatorValue, MultiplyOperatorValue, SubtractOperatorValue } from "./values/operator";

export interface Value<TValue> {

  readonly _?: TValue;

  toString(): string;

  _eval(data?: unknown): TValue;
}

export interface ODataOptions {
  count?: Count;
  expand?: Expand[];
  filter?: Filter[];
  orderBy?: OrderBy[];
  select?: Select[];
  skip?: Skip;
  top?: Top;
}

export interface ODataResult {
  "@odata.context"?: string;
}

export interface ODataResultSet<TEntity> extends ODataResult {
  "@odata.count"?: number;
  value: TEntity[];
}

export interface Expand {
  property: string;
  value: EntityExpand<unknown>;
}

export function expandToString(expand: Expand[]): string {
  const useValue = expand.map(expand => expand.value.toString()).join(', ');
  return useValue;
}

export type Filter = Value<boolean>;

export function filterToString(filter: Filter[]): string {
  let useValue: string;
  if (filter.length > 1) {
    useValue = o.and(...filter).toString();
  } else {
    useValue = filter[0].toString();
  }

  return useValue;
}

export type Direction = 'asc' | 'desc';

export interface OrderBy {
  property: string;
  direction: Direction;
}

export function orderByToString(orderBy: OrderBy[]): string {
  const useValue = orderBy.map(orderBy => `${orderBy.property} ${orderBy.direction}`).join(', ');
  return useValue;
}

export type Select = string;

export function selectToString(select: Select[]): string {
  const useValue = select.join(', ');
  return useValue;
}

export type Skip = number;

export function skipToString(skip: Skip): string {
  const useValue = skip.toFixed(0);
  return useValue;
}

export type Top = number;

export function topToString(top: Top): string {
  const useValue = top.toFixed(0);
  return useValue;
}

export type Count = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsObjectOrArray<TValue> = TValue extends object ? (TValue extends Array<any> ? (TValue[number] extends object ? TValue : never) : TValue): never;

export interface ODataResponse<TEntity> extends AsyncIterable<TEntity> {
  count: Promise<number>;
  toArray(): Promise<TEntity[]>;
}

export interface EntityAccessor<TEntity> {
  prop<TKey extends keyof TEntity & string>(property: TKey): Value<TEntity[TKey]>;
  all<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
  any<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
}

export type EntityResponse<TEntity> = {
  data: Promise<TEntity>;
}

export type EntitySetResponse<TEntity> = {
  count: Promise<number>;
  data: Promise<TEntity[]>;
  iterator: AsyncIterable<TEntity>;
}

export interface QueryParams {
  [key: string]: string
}

export interface EntitySet<TEntity> {
  count(): EntitySet<TEntity>;
  execute(): EntitySetResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntitySet<TEntity>;
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity>;
  orderBy(property: keyof TEntity & string, direction?: Direction): OrderedEntitySet<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>>;
  skip(count: number): EntitySet<TEntity>;
  top(count: number): EntitySet<TEntity>;
  getParams(): QueryParams;
}

export interface OrderedEntitySet<TEntity> extends EntitySet<TEntity> {
  thenBy(property: keyof TEntity & string, direction?: Direction): EntitySet<TEntity>;
}

export interface EntitySingle<TEntity> {
  execute(): EntityResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntitySingle<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>>;
}

export interface EntityExpand<TEntity> {
  count(): EntityExpand<TEntity>;
  expand<TExpanded extends keyof TEntity & string>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntityExpand<TEntity>;
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntityExpand<TEntity>;
  orderBy(property: keyof TEntity & string, direction?: Direction): OrderedEntityExpand<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntityExpand<Pick<TEntity, TSelected>>;
  skip(count: number): EntityExpand<TEntity>;
  top(count: number): EntityExpand<TEntity>;
  toString(): string;
}

export interface OrderedEntityExpand<TEntity> extends EntityExpand<TEntity> {
  thenBy(property: keyof TEntity & string, direction?: Direction): OrderedEntityExpand<TEntity>;
}

export class o {

  //Logical operators

  //(... and ...)
  static and(...conditions: Value<boolean>[]): Value<boolean> {
    return new AndLogicalValue(...conditions);
  }

  //(... or ...)
  static or(...conditions: Value<boolean>[]): Value<boolean> {
    return new OrLogicalValue(...conditions);
  }

  //not (...)
  static not(condition: Value<boolean>): Value<boolean> {
    return new NotLogicalValue(condition);
  }

  //Comparison operators

  //... eq ...
  static eq<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new EqualsComparisonValue(left, right);
  }

  //... ne ...
  static ne<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new NotEqualsComparisonValue(left, right);
  }

  //... lt ...
  static lt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new LessThanComparisonValue(left, right);
  }

  //... le ...
  static le<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new LessThanOrEqualsComparisonValue(left, right);
  }

  //... gt ...
  static gt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new GreaterThanComparisonValue(left, right);
  }

  //... ge ...
  static ge<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean> {
    return new GreaterThanOrEqualsComparisonValue(left, right);
  }

  //String operators

  //contains(..., ...)
  static contains(string: Value<string>, contains: Value<string>): Value<boolean> {
    return new ContainsFunctionValue(string, contains);
  }

  //startswith(..., ...)
  static startsWith(string: Value<string>, startsWith: Value<string>): Value<boolean> {
    return new StartsWithFunctionValue(string, startsWith);
  }

  //endswith(..., ...)
  static endsWith(string: Value<string>, endsWith: Value<string>): Value<boolean> {
    return new EndsWithFunctionValue(string, endsWith);
  }

  //concat(..., ...)
  static concat(left: Value<string>, right: Value<string>): Value<string> {
    return new ConcatFunctionValue(left, right);
  }

  //indexof(..., ...)
  static indexOf(string: Value<string>, indexOf: Value<string>): Value<number> {
    return new IndexOfFunctionValue(string, indexOf);
  }

  //length(...)
  static lengthOf(value: Value<string>): Value<number> {
    return new LengthFunctionValue(value);
  }

  //substring(..., ...)
  //substring(..., ..., ...)
  static substring(value: Value<string>, start: Value<number>, finish?: Value<number>) {
    return new SubstringFunctionValue(value, start, finish);
  }

  //tolower(...)
  static toLower(value: Value<string>): Value<string> {
    return new ToLowerFunctionValue(value);
  }

  //toupper(...)
  static toUpper(value: Value<string>): Value<string> {
    return new ToUpperFunctionValue(value);
  }

  //trim(...)
  static trim(value: Value<string>): Value<string> {
    return new TrimFunctionValue(value);
  }

  //Arithmetic operators

  //(... add ...)
  static add(left: Value<number>, right: Value<number>): Value<number> {
    return new AddOperatorValue(left, right);
  }

  //(... sub ...)
  static subtract(left: Value<number>, right: Value<number>): Value<number> {
    return new SubtractOperatorValue(left, right);
  }

  //(... mul ...)
  static multiply(left: Value<number>, right: Value<number>): Value<number> {
    return new MultiplyOperatorValue(left, right);
  }

  //(... div ...)
  static divide(left: Value<number>, right: Value<number>): Value<number> {
    return new DivideOperatorValue(left, right);
  }

  //(... mod ...)
  static modulo(left: Value<number>, right: Value<number>): Value<number> {
    return new ModuloOperatorValue(left, right);
  }

  //ceiling(...)
  static ceiling(value: Value<number>): Value<number> {
    return new CeilingFunctionValue(value);
  }

  //floor(...)
  static floor(value: Value<number>): Value<number> {
    return new FloorFunctionValue(value);
  }

  //round(...)
  static round(value: Value<number>): Value<number> {
    return new RoundFunctionValue(value);
  }

  //Constant values

  //null
  static null() {
    return new NullConstantValue();
  }

  //'...'
  static string(value: string): Value<string> {
    return new StringConstantValue(value);
  }

  //...
  static bool(value: boolean): Value<boolean> {
    return new BooleanConstantValue(value);
  }

  //...
  static int(value: number): Value<number> {
    return new IntegerConstantValue(value);
  }

  //...
  static guid(value: Guid): Value<Guid> {
    return new GuidConstantValue(value);
  }

  //...
  static date(value: Date): Value<Date> {
    return new DateConstantValue(value);
  }

  //...
  static dateTime(value: Date): Value<Date> {
    return new DateTimeConstantValue(value);
  }

  //...
  static time(value: Date): Value<Date> {
    return new TimeConstantValue(value);
  }
}
