import { Guid } from "../types/guid";
import { SafeAny } from "../utils/types";
import { EqualsComparisonValue, GreaterThanComparisonValue, GreaterThanOrEqualsComparisonValue, LessThanComparisonValue, LessThanOrEqualsComparisonValue, NotEqualsComparisonValue } from "./comparison";
import { BooleanConstantValue, DateConstantValue, DateTimeConstantValue, DoubleConstantValue, GuidConstantValue, IntegerConstantValue, NullConstantValue, StringConstantValue, TimeConstantValue } from "./constant";
import { CeilingFunctionValue, ConcatFunctionValue, ContainsFunctionValue, EndsWithFunctionValue, FloorFunctionValue, IndexOfFunctionValue, LengthFunctionValue, RoundFunctionValue, StartsWithFunctionValue, SubstringFunctionValue, ToLowerFunctionValue, ToUpperFunctionValue, TrimFunctionValue } from "./function";
import { AndLogicalValue, NotLogicalValue, OrLogicalValue } from "./logical";
import { AddOperatorValue, DivideOperatorValue, ModuloOperatorValue, MultiplyOperatorValue, SubtractOperatorValue } from "./operator";

/**
 * A generic value.
 */
export interface Value<TValue> {

  /**
   * This property DOES NOT exist. It is necessary so TypeScript doesn't equate two values of different types.
   */
  readonly _?: TValue;

  /**
   * Converts the value into a string, typically for the use in $filter.
   */
  toString(): string;

  /**
   * Evaluates the value against the provided data. You probably do not want to call this.
   * @param data The data to evaluate against.
   */
  eval(data?: unknown): TValue;
}

/**
 * Creates a value from the provided arguments.
 */
export type ValueFactory<TArgs extends SafeAny[] = SafeAny[], TOutput = SafeAny> =
  (...args: TArgs) => Value<TOutput>;

/**
 * Creates the default set of operators.
 */
export function createOperatorFactory(): OperatorFactory;
/**
 * Creates a custom set of operators, allowing overriding the defaults as desired.
 * @param customOperators The custom operators.
 */
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

/**
 * The default operator factory.
 */
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
  double(value) {
    return new DoubleConstantValue(value);
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

  /**
   * Creates a logical AND of multiple conditions.
   * @param conditions The boolean conditions to combine.
   * @returns A Value representing the conjunction of all conditions.
   */
  and(...conditions: Value<boolean>[]): Value<boolean>;
  /**
   * Creates a logical OR of multiple conditions.
   * @param conditions The boolean conditions to combine.
   * @returns A Value representing the disjunction of all conditions.
   */
  or(...conditions: Value<boolean>[]): Value<boolean>;
  /**
   * Negates a boolean condition.
   * @param condition The boolean condition to negate.
   * @returns A Value representing the negation of the input.
   */
  not(condition: Value<boolean>): Value<boolean>;
  
  //Comparison operators

  /**
   * Checks if two values are equal.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether the two values are equal.
   */
  eq<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /**
   * Checks if two values are not equal.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether the two values are not equal.
   */
  ne<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /**
   * Checks if the first value is less than the second.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether left is less than right.
   */
  lt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /**
   * Checks if the first value is less than or equal to the second.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether left is less than or equal to right.
   */
  le<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /**
   * Checks if the first value is greater than the second.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether left is greater than right.
   */
  gt<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  /**
   * Checks if the first value is greater than or equal to the second.
   * @param left The first value.
   * @param right The second value.
   * @returns A Value indicating whether left is greater than or equal to right.
   */
  ge<TValue>(left: Value<TValue>, right: Value<TValue>): Value<boolean>;
  
  //String operators

  /**
   * Determines if a string contains a specified substring.
   * @param string The string to search.
   * @param contains The substring to look for.
   * @returns A Value indicating whether the substring is found.
   */
  contains(string: Value<string>, contains: Value<string>): Value<boolean>;
  /**
   * Determines if a string starts with a specified prefix.
   * @param string The string to test.
   * @param startsWith The prefix to check.
   * @returns A Value indicating whether the string starts with the prefix.
   */
  startsWith(string: Value<string>, startsWith: Value<string>): Value<boolean>;
  /**
   * Determines if a string ends with a specified suffix.
   * @param string The string to test.
   * @param endsWith The suffix to check.
   * @returns A Value indicating whether the string ends with the suffix.
   */
  endsWith(string: Value<string>, endsWith: Value<string>): Value<boolean>;
  /**
   * Concatenates two strings.
   * @param left The first string.
   * @param right The second string.
   * @returns A Value representing the concatenated string.
   */
  concat(left: Value<string>, right: Value<string>): Value<string>;
  /**
   * Finds the index of a substring within a string.
   * @param string The string to search.
   * @param indexOf The substring to locate.
   * @returns A Value representing the zero-based index of the substring.
   */
  indexOf(string: Value<string>, indexOf: Value<string>): Value<number>;
  /**
   * Gets the length of a string.
   * @param value The string value.
   * @returns A Value representing the length of the string.
   */
  lengthOf(value: Value<string>): Value<number>;
  /**
   * Extracts a substring from a string.
   * @param value The source string.
   * @param start The zero-based start index.
   * @param finish The zero-based end index (exclusive), if provided.
   * @returns A Value representing the extracted substring.
   */
  substring(value: Value<string>, start: Value<number>, finish?: Value<number>): Value<string>;
  /**
   * Converts a string to lowercase.
   * @param value The string to convert.
   * @returns A Value representing the lowercase string.
   */
  toLower(value: Value<string>): Value<string>;
  /**
   * Converts a string to uppercase.
   * @param value The string to convert.
   * @returns A Value representing the uppercase string.
   */
  toUpper(value: Value<string>): Value<string>;
  /**
   * Trims whitespace from both ends of a string.
   * @param value The string to trim.
   * @returns A Value representing the trimmed string.
   */
  trim(value: Value<string>): Value<string>;

  //Arithmetic operators

  /**
   * Adds two numbers.
   * @param left The first number.
   * @param right The second number.
   * @returns A Value representing the sum.
   */
  add(left: Value<number>, right: Value<number>): Value<number>;
  /**
   * Subtracts one number from another.
   * @param left The minuend.
   * @param right The subtrahend.
   * @returns A Value representing the difference.
   */
  subtract(left: Value<number>, right: Value<number>): Value<number>;
  /**
   * Multiplies two numbers.
   * @param left The first factor.
   * @param right The second factor.
   * @returns A Value representing the product.
   */
  multiply(left: Value<number>, right: Value<number>): Value<number>;
  /**
   * Divides one number by another.
   * @param left The dividend.
   * @param right The divisor.
   * @returns A Value representing the quotient.
   */
  divide(left: Value<number>, right: Value<number>): Value<number>;
  /**
   * Computes the remainder of division.
   * @param left The dividend.
   * @param right The divisor.
   * @returns A Value representing the remainder.
   */
  modulo(left: Value<number>, right: Value<number>): Value<number>;
  /**
   * Rounds a number up to the nearest integer.
   * @param value The number to ceil.
   * @returns A Value representing the ceiling of the input.
   */
  ceiling(value: Value<number>): Value<number>;
  /**
   * Rounds a number down to the nearest integer.
   * @param value The number to floor.
   * @returns A Value representing the floor of the input.
   */
  floor(value: Value<number>): Value<number>;
  /**
   * Rounds a number to the nearest integer.
   * @param value The number to round.
   * @returns A Value representing the rounded input.
   */
  round(value: Value<number>): Value<number>;

  //Constant values

  /**
   * Creates a null constant.
   * @returns A Value representing null.
   */
  null(): Value<SafeAny>;
  /**
   * Creates a boolean constant.
   * @param value The boolean value.
   * @returns A Value representing the boolean constant.
   */
  bool(value: boolean): Value<boolean>;
  /**
   * Creates a Date constant (date portion only).
   * @param value The Date value.
   * @returns A Value representing the date constant.
   */
  date(value: Date): Value<Date>;
  /**
   * Creates a DateTime constant.
   * @param value The Date value.
   * @returns A Value representing the date-time constant.
   */
  dateTime(value: Date): Value<Date>;
  /**
   * Creates a double constant.
   * @param value The number value.
   * @returns A Value representing the double constant.
   */
  double(value: number): Value<number>;
  /**
   * Creates a GUID constant.
   * @param value The GUID value.
   * @returns A Value representing the GUID constant.
   */
  guid(value: Guid): Value<Guid>;
  /**
   * Creates an integer constant.
   * @param value The integer value.
   * @returns A Value representing the integer constant.
   */
  int(value: number): Value<number>;
  /**
   * Creates a string constant.
   * @param value The string value.
   * @returns A Value representing the string constant.
   */
  string(value: string): Value<string>;
  /**
   * Creates a time constant (time portion only).
   * @param value The Date value.
   * @returns A Value representing the time constant.
   */
  time(value: Date): Value<Date>;
}
