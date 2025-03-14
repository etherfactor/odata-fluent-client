import { Value } from "./base";

abstract class FunctionValue<TValue> implements Value<TValue> {

  protected readonly name: string;
  protected readonly args: Value<unknown>[];

  constructor(name: string, ...args: Value<unknown>[]) {
    this.name = name;
    this.args = args;
  }

  toString(): string {
    return `${this.name}(${this.args.map(item => item.toString()).join(', ')})`;
  }

  abstract eval(data?: unknown): TValue;
}

export class ContainsFunctionValue extends FunctionValue<boolean> {

  constructor(string: Value<string>, contains: Value<string>) {
    super('contains', string, contains);
  }

  override eval(data?: unknown): boolean {
    const root = (this.args[0] as Value<string>).eval(data).toLowerCase();
    const arg1 = (this.args[1] as Value<string>).eval(data).toLowerCase();
    return root.includes(arg1);
  }
}

export class StartsWithFunctionValue extends FunctionValue<boolean> {

  constructor(string: Value<string>, startsWith: Value<string>) {
    super('startswith', string, startsWith);
  }

  override eval(data?: unknown): boolean {
    const root = (this.args[0] as Value<string>).eval(data).toLowerCase();
    const arg1 = (this.args[1] as Value<string>).eval(data).toLowerCase();
    return root.startsWith(arg1);
  }
}

export class EndsWithFunctionValue extends FunctionValue<boolean> {

  constructor(string: Value<string>, endsWith: Value<string>) {
    super('endswith', string, endsWith);
  }

  override eval(data?: unknown): boolean {
    const root = (this.args[0] as Value<string>).eval(data).toLowerCase();
    const arg1 = (this.args[1] as Value<string>).eval(data).toLowerCase();
    return root.endsWith(arg1);
  }
}

export class ConcatFunctionValue extends FunctionValue<string> {

  constructor(left: Value<string>, right: Value<string>) {
    super('concat', left, right);
  }

  override eval(data?: unknown): string {
    const root = (this.args[0] as Value<string>).eval(data);
    const arg1 = (this.args[1] as Value<string>).eval(data);
    return root.concat(arg1);
  }
}

export class IndexOfFunctionValue extends FunctionValue<number> {

  constructor(string: Value<string>, indexOf: Value<string>) {
    super('indexof', string, indexOf);
  }

  override eval(data?: unknown): number {
    const root = (this.args[0] as Value<string>).eval(data).toLowerCase();
    const arg1 = (this.args[1] as Value<string>).eval(data).toLowerCase();
    return root.indexOf(arg1);
  }
}

export class LengthFunctionValue extends FunctionValue<number> {

  constructor(string: Value<string>) {
    super('length', string);
  }

  override eval(data?: unknown): number {
    const root = (this.args[0] as Value<string>).eval(data);
    return root.length;
  }
}

export class SubstringFunctionValue extends FunctionValue<string> {

  constructor(value: Value<string>, start: Value<number>, finish?: Value<number>) {
    if (finish) {
      super('substring', value, start, finish);
    } else {
      super('substring', value, start);
    }
  }

  override eval(data?: unknown): string {
    const root = (this.args[0] as Value<string>).eval(data);
    const arg1 = (this.args[1] as Value<number>).eval(data);
    const arg2 = (this.args[2] as Value<number>).eval(data);
    return root.substring(arg1, arg2);
  }
}

export class ToLowerFunctionValue extends FunctionValue<string> {

  constructor(value: Value<string>) {
    super('tolower', value);
  }

  override eval(data?: unknown): string {
    const root = (this.args[0] as Value<string>).eval(data);
    return root.toLowerCase();
  }
}

export class ToUpperFunctionValue extends FunctionValue<string> {

  constructor(value: Value<string>) {
    super('toupper', value);
  }

  override eval(data?: unknown): string {
    const root = (this.args[0] as Value<string>).eval(data);
    return root.toUpperCase();
  }
}

export class TrimFunctionValue extends FunctionValue<string> {

  constructor(value: Value<string>) {
    super('trim', value);
  }

  override eval(data?: unknown): string {
    const root = (this.args[0] as Value<string>).eval(data);
    return root.trim();
  }
}

export class CeilingFunctionValue extends FunctionValue<number> {

  constructor(value: Value<number>) {
    super('ceiling', value);
  }

  override eval(data?: unknown): number {
    const root = (this.args[0] as Value<number>).eval(data);
    return Math.ceil(root);
  }
}

export class FloorFunctionValue extends FunctionValue<number> {

  constructor(value: Value<number>) {
    super('floor', value);
  }

  override eval(data?: unknown): number {
    const root = (this.args[0] as Value<number>).eval(data);
    return Math.floor(root);
  }
}

export class RoundFunctionValue extends FunctionValue<number> {

  constructor(value: Value<number>) {
    super('round', value);
  }

  override eval(data?: unknown): number {
    const root = (this.args[0] as Value<number>).eval(data);
    return Math.round(root);
  }
}
