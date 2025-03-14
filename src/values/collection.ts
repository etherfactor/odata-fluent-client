import { Value } from "./base";

abstract class CollectionValue implements Value<boolean> {

  protected readonly property: string;
  protected readonly operand: string;
  protected readonly path: string;
  protected readonly value: Value<boolean>;

  constructor(property: string, operand: string, path: string, value: Value<boolean>) {
    this.property = property;
    this.operand = operand;
    this.path = path;
    this.value = value;
  }

  toString(): string {
    return `${this.property}/${this.operand}(${this.path}: ${this.value.toString()})`;
  }

  abstract eval(data?: unknown): boolean;
}

export class AllCollectionValue extends CollectionValue {

  constructor(property: string, path: string, value: Value<boolean>) {
    super(property, 'all', path, value);
  }

  eval(data?: unknown): boolean {
    if (!data)
      return false;

    if (typeof data !== 'object')
      return false;

    const array = data[this.property as keyof typeof data] as object[];
    const result = array.reduce((prev, curr) => prev && this.value.eval(curr), true);

    return result;
  }
}

export class AnyCollectionValue extends CollectionValue {

  constructor(property: string, path: string, value: Value<boolean>) {
    super(property, 'any', path, value);
  }

  eval(data?: unknown): boolean {
    if (!data)
      return false;

    if (typeof data !== 'object')
      return false;

    const array = data[this.property as keyof typeof data] as object[];
    const result = array.reduce((prev, curr) => prev || this.value.eval(curr), false);

    return result;
  }
}
