import { Value } from "./base";

abstract class ComparisonValue<TValue> implements Value<boolean> {

  protected readonly left: Value<TValue>;
  protected readonly comparator: string;
  protected readonly right: Value<TValue>;

  constructor(left: Value<TValue>, comparator: string, right: Value<TValue>) {
    this.left = left;
    this.comparator = comparator;
    this.right = right;
  }

  toString(): string {
    return `${this.left.toString()} ${this.comparator} ${this.right.toString()}`;
  }

  abstract eval(data?: unknown): boolean;
}

export class EqualsComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'eq', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left === right;
  }
}

export class NotEqualsComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'ne', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left !== right;
  }
}

export class GreaterThanComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'gt', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left > right;
  }
}

export class GreaterThanOrEqualsComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'ge', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left >= right;
  }
}

export class LessThanComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'lt', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left < right;
  }
}

export class LessThanOrEqualsComparisonValue<TValue> extends ComparisonValue<TValue> {

  constructor(left: Value<TValue>, right: Value<TValue>) {
    super(left, 'le', right);
  }

  eval(data?: unknown): boolean {
    let left = this.left.eval(data);
    if (typeof left === 'string')
      left = left.toLowerCase() as TValue;

    let right = this.right.eval(data);
    if (typeof right === 'string')
      right = right.toLowerCase() as TValue;

    return left <= right;
  }
}
