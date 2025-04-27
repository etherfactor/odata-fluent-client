import { Value } from "./base";

abstract class LogicalValue implements Value<boolean> {

  protected readonly operand: string;
  protected readonly conditions: Value<boolean>[];

  constructor(operand: string, ...conditions: Value<boolean>[]) {
    this.operand = operand;
    this.conditions = conditions;
  }

  toString(): string {
    return `(${this.conditions.map(item => item.toString()).join(` ${this.operand} `)})`;
  }

  abstract eval(data?: unknown): boolean;
}

export class AndLogicalValue extends LogicalValue {

  constructor(...conditions: Value<boolean>[]) {
    super('and', ...conditions);
  }

  override eval(data?: unknown): boolean {
    const result = this.conditions.reduce((prev, curr) => prev && curr.eval(data), true);
    return result;
  }
}

export class OrLogicalValue extends LogicalValue {

  constructor(...conditions: Value<boolean>[]) {
    super('or', ...conditions);
  }

  override eval(data?: unknown): boolean {
    const result = this.conditions.reduce((prev, curr) => prev || curr.eval(data), false);
    return result;
  }
}

export class NotLogicalValue implements Value<boolean> {
  private readonly condition: Value<boolean>;

  constructor(condition: Value<boolean>) {
    this.condition = condition;
  }

  toString(): string {
    return `not ${this.condition.toString()}`;
  }

  eval(data?: unknown): boolean {
    const result = !this.condition.eval(data);
    return result;
  }
}
