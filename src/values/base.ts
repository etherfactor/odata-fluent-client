import { Guid } from "../types/guid";
import { SafeAny } from "../utils/types";
import { EqualsComparisonValue, GreaterThanComparisonValue, GreaterThanOrEqualsComparisonValue, LessThanComparisonValue, LessThanOrEqualsComparisonValue, NotEqualsComparisonValue } from "./comparison";
import { BooleanConstantValue, DateConstantValue, DateTimeConstantValue, GuidConstantValue, IntegerConstantValue, NullConstantValue, StringConstantValue, TimeConstantValue } from "./constant";
import { CeilingFunctionValue, ConcatFunctionValue, ContainsFunctionValue, EndsWithFunctionValue, FloorFunctionValue, IndexOfFunctionValue, LengthFunctionValue, RoundFunctionValue, StartsWithFunctionValue, SubstringFunctionValue, ToLowerFunctionValue, ToUpperFunctionValue, TrimFunctionValue } from "./function";
import { AndLogicalValue, NotLogicalValue, OrLogicalValue } from "./logical";
import { AddOperatorValue, DivideOperatorValue, ModuloOperatorValue, MultiplyOperatorValue, SubtractOperatorValue } from "./operator";

export interface Value<TValue> {

  readonly _?: TValue;

  toString(): string;

  eval(data?: unknown): TValue;
}

export type ValueFactory<TArgs extends SafeAny[] = SafeAny[], TOutput = SafeAny> =
  (...args: TArgs) => Value<TOutput>;

export function createOperatorFactory(): OperatorFactory;
export function createOperatorFactory<TOperators extends Record<string, ValueFactory>>(customOperators: TOperators) : ExtendedOperatorFactory<TOperators>;
export function createOperatorFactory<TOperators extends Record<string, ValueFactory>>(
  customOperators?: TOperators
): ExtendedOperatorFactory<TOperators> {
  const finalFactory = {
    ...defaultOperatorFactory,
    ...customOperators,
  } as unknown as ExtendedOperatorFactory<TOperators>;

  return finalFactory;
}

const defaultOperatorFactory: OperatorFactory = {
  add(left, right) {
    return new AddOperatorValue(left, right);
  },
  and(...conditions) {
    return new AndLogicalValue(...conditions);
  },
  bool(value) {
    return new BooleanConstantValue(value);
  },
  ceiling(value) {
    return new CeilingFunctionValue(value);
  },
  concat(left, right) {
    return new ConcatFunctionValue(left, right);
  },
  contains(string, contains) {
    return new ContainsFunctionValue(string, contains);
  },
  date(value) {
    return new DateConstantValue(value);
  },
  dateTime(value) {
    return new DateTimeConstantValue(value);
  },
  divide(left, right) {
    return new DivideOperatorValue(left, right);
  },
  endsWith(string, endsWith) {
    return new EndsWithFunctionValue(string, endsWith);
  },
  eq(left, right) {
    return new EqualsComparisonValue(left, right);
  },
  floor(value) {
    return new FloorFunctionValue(value);
  },
  ge(left, right) {
    return new GreaterThanOrEqualsComparisonValue(left, right);
  },
  gt(left, right) {
    return new GreaterThanComparisonValue(left, right);
  },
  guid(value) {
    return new GuidConstantValue(value);
  },
  indexOf(string, indexOf) {
    return new IndexOfFunctionValue(string, indexOf);
  },
  int(value) {
    return new IntegerConstantValue(value);
  },
  le(left, right) {
    return new LessThanOrEqualsComparisonValue(left, right);
  },
  lengthOf(value) {
    return new LengthFunctionValue(value);
  },
  lt(left, right) {
    return new LessThanComparisonValue(left, right);
  },
  modulo(left, right) {
    return new ModuloOperatorValue(left, right);
  },
  multiply(left, right) {
    return new MultiplyOperatorValue(left, right);
  },
  ne(left, right) {
    return new NotEqualsComparisonValue(left, right);
  },
  not(condition) {
    return new NotLogicalValue(condition);
  },
  null() {
    return new NullConstantValue();
  },
  or(...conditions) {
    return new OrLogicalValue(...conditions);
  },
  round(value) {
    return new RoundFunctionValue(value);
  },
  startsWith(string, startsWith) {
    return new StartsWithFunctionValue(string, startsWith);
  },
  string(value) {
    return new StringConstantValue(value);
  },
  substring(value, start, finish) {
    return new SubstringFunctionValue(value, start, finish);
  },
  subtract(left, right) {
    return new SubtractOperatorValue(left, right);
  },
  time(value) {
    return new TimeConstantValue(value);
  },
  toLower(value) {
    return new ToLowerFunctionValue(value);
  },
  toUpper(value) {
    return new ToUpperFunctionValue(value);
  },
  trim(value) {
    return new TrimFunctionValue(value);
  },
};

export type ExtendedOperatorFactory<TOperators extends Record<string, ValueFactory>> =
  TOperators extends object
    ? Omit<OperatorFactory, keyof TOperators> & TOperators
    : OperatorFactory;

export interface OperatorFactory {

  //Logical operators

  /** (... and ...) */
  and(...conditions: Value<boolean>[]): Value<boolean>;
  /** (... or ...) */
  or(...conditions: Value<boolean>[]): Value<boolean>;
  /** not (...) */
  not(condition: Value<boolean>): Value<boolean>;
  
  //Comparison operators

  /** ... eq ... */
  eq<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /** ... ne ... */
  ne<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /** ... lt ... */
  lt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /** ... le ... */
  le<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /** ... gt ... */
  gt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /** ... ge ... */
  ge<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  
  //String operators

  /** contains(..., ...) */
  contains(string: Value<string>, contains: Value<string>): Value<boolean>;
  /** startswith(..., ...) */
  startsWith(string: Value<string>, startsWith: Value<string>): Value<boolean>;
  /** endswith(..., ...) */
  endsWith(string: Value<string>, endsWith: Value<string>): Value<boolean>;
  /** concat(..., ...) */
  concat(left: Value<string>, right: Value<string>): Value<string>;
  /** indexof(..., ...) */
  indexOf(string: Value<string>, indexOf: Value<string>): Value<number>;
  /** length(...) */
  lengthOf(value: Value<string>): Value<number>;
  /** substring(..., ...); substring(..., ..., ...) */
  substring(value: Value<string>, start: Value<number>, finish?: Value<number>): Value<string>;
  /** tolower(...) */
  toLower(value: Value<string>): Value<string>;
  /** toupper(...) */
  toUpper(value: Value<string>): Value<string>;
  /** trim(...) */
  trim(value: Value<string>): Value<string>;

  //Arithmetic operators

  /** (... add ...) */
  add(left: Value<number>, right: Value<number>): Value<number>
  /** (... sub ...) */
  subtract(left: Value<number>, right: Value<number>): Value<number>;
  /** (... mul ...) */
  multiply(left: Value<number>, right: Value<number>): Value<number>;
  /** (... div ...) */
  divide(left: Value<number>, right: Value<number>): Value<number>;
  /** (... mod ...) */
  modulo(left: Value<number>, right: Value<number>): Value<number>;
  /** ceiling(...) */
  ceiling(value: Value<number>): Value<number>;
  /** floor(...) */
  floor(value: Value<number>): Value<number>;
  /** round(...) */
  round(value: Value<number>): Value<number>;

  //Constant values

  /** null */
  null(): Value<SafeAny>;
  /** '...' */
  string(value: string): Value<string>;
  /** ... */
  bool(value: boolean): Value<boolean>;
  /** ... */
  int(value: number): Value<number>;
  /** ... */
  guid(value: Guid): Value<Guid>;
  /** ... */
  date(value: Date): Value<Date>;
  /** ... */
  dateTime(value: Date): Value<Date>;
  /** ... */
  time(value: Date): Value<Date>;
}
