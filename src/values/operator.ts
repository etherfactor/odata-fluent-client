import { Value } from "./base";

abstract class OperatorValue implements Value<number> {

  protected readonly left: Value<number>;
  protected readonly operator: string;
  protected readonly right: Value<number>;

  constructor(left: Value<number>, operator: string, right: Value<number>) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
  }

  abstract eval(data?: unknown): number;
}

export class AddOperatorValue extends OperatorValue {

  constructor(left: Value<number>, right: Value<number>) {
    super(left, 'add', right);
  }

  eval(data?: unknown): number {
    const left = this.left.eval(data);
    const right = this.right.eval(data);
    return left + right;
  }
}

export class SubtractOperatorValue extends OperatorValue {

  constructor(left: Value<number>, right: Value<number>) {
    super(left, 'sub', right);
  }

  eval(data?: unknown): number {
    const left = this.left.eval(data);
    const right = this.right.eval(data);
    return left - right;
  }
}

export class MultiplyOperatorValue extends OperatorValue {

  constructor(left: Value<number>, right: Value<number>) {
    super(left, 'mul', right);
  }

  eval(data?: unknown): number {
    const left = this.left.eval(data);
    const right = this.right.eval(data);
    return left * right;
  }
}

export class DivideOperatorValue extends OperatorValue {

  constructor(left: Value<number>, right: Value<number>) {
    super(left, 'div', right);
  }

  eval(data?: unknown): number {
    const left = this.left.eval(data);
    const right = this.right.eval(data);
    return left / right;
  }
}

export class ModuloOperatorValue extends OperatorValue {

  constructor(left: Value<number>, right: Value<number>) {
    super(left, 'mod', right);
  }

  eval(data?: unknown): number {
    const left = this.left.eval(data);
    const right = this.right.eval(data);
    return left % right;
  }
}
