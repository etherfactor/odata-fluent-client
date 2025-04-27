import { Guid } from "../types/guid";
import { Value } from "./base";

abstract class ConstantValue<TValue> implements Value<TValue> {

  constructor() {
  }

  abstract eval(): TValue;
}

export class BooleanConstantValue extends ConstantValue<boolean> {

  protected readonly value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toString();
  }

  override eval(): boolean {
    return this.value;
  }
}

export class DateConstantValue extends ConstantValue<Date> {

  private readonly value: Date;

  constructor(value: Date) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toISOString().split("T")[0];
  }

  override eval(): Date {
    return this.value;
  }
}

export class DateTimeConstantValue extends ConstantValue<Date> {

  private readonly value: Date;

  constructor(value: Date) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toISOString();
  }

  override eval(): Date {
    return this.value;
  }
}

export class DoubleConstantValue extends ConstantValue<number> {

  private readonly value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toString();
  }

  override eval(): number {
    return this.value;
  }
}

export class GuidConstantValue extends ConstantValue<Guid> {

  private readonly value: Guid;

  constructor(value: Guid) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value;
  }

  override eval(): Guid {
    return this.value;
  }
}

export class IntegerConstantValue extends ConstantValue<number> {

  private readonly value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toString();
  }

  override eval(): number {
    return this.value;
  }
}

export class NullConstantValue extends ConstantValue<any> {

  override toString() {
    return 'null';
  }

  override eval(): any {
    return null;
  }
}

export class StringConstantValue extends ConstantValue<string> {

  private readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  override toString() {
    return `'${this.value.replace("'", "''")}'`;
  }

  override eval(): string {
    return this.value;
  }
}

export class TimeConstantValue extends ConstantValue<Date> {

  private readonly value: Date;

  constructor(value: Date) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value.toISOString().split("T")[1].replace("Z", "");
  }

  override eval(): Date {
    return this.value;
  }
}
