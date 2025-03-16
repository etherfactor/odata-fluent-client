import { AnyArray, InferArrayType } from "../../utils/types";
import { Value } from "../../values/base";
import { AllCollectionValue, AnyCollectionValue } from "../../values/collection";
import { EntityPropertyValue } from "../../values/property";
import { PrefixGenerator } from "../prefix-generator";

export interface EntityAccessor<TEntity> {
  prop<TKey extends keyof TEntity & string>(property: TKey): Value<TEntity[TKey]>;
  all<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
  any<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
}

export class EntityAccessorImpl<TEntity> {

  private readonly path?: string;

  readonly generator: PrefixGenerator;

  constructor(generator: PrefixGenerator, path?: string) {
    this.generator = generator;
    this.path = path;
  }

  prop<TKey extends keyof TEntity & string>(property: TKey): Value<TEntity[TKey]> {
    return new EntityPropertyValue<TEntity, TKey>(this.path, property);
  }

  all<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value < boolean > {
    const generator = this.generator;
    const path = generator.getPath();
    const accessor = new EntityAccessorImpl<InferArrayType<TEntity[TKey]>>(generator, path);

    const value = builder(accessor);
    return new AllCollectionValue(property, path, value);
  }

  any<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean> {
    const generator = this.generator;
    const path = generator.getPath();
    const accessor = new EntityAccessorImpl<InferArrayType<TEntity[TKey]>>(generator, path);

    const value = builder(accessor);
    return new AnyCollectionValue(property, path, value);
  }
}
