import { PrefixGenerator } from "../../../utils/prefix-generator";
import { AnyArray, InferArrayType } from "../../../utils/types";
import { Value } from "../../../values/base";
import { AllCollectionValue, AnyCollectionValue } from "../../../values/collection";
import { EntityPropertyValue } from "../../../values/property";

/**
 * Provides access to an entity's properties.
 */
export interface EntityAccessor<TEntity> {
  /**
   * Selects a single property from an entity.
   * @param property The name of the property.
   */
  prop<TKey extends keyof TEntity & string>(property: TKey): Value<TEntity[TKey]>;
  /**
   * Tests if all items in a collection on the entity match a condition.
   * @param property The name of the collection property.
   * @param builder The condition builder.
   */
  all<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
  /**
   * Tests if any item in a collection on the entity matches a condition.
   * @param property The name of the collection property.
   * @param builder The condition builder.
   */
  any<TKey extends keyof TEntity & string>(property: TKey extends keyof TEntity ? (TEntity[TKey] extends AnyArray ? TKey : never) : never, builder: (entity: EntityAccessor<InferArrayType<TEntity[TKey]>>) => Value<boolean>): Value<boolean>;
}

/**
 * The entity accessor implementation. There isn't a distinction between a physical and mock accessor. Really, this thing
 * just acts as a helper.
 */
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
