import { HttpMethod } from "../../../../utils/http";
import { SafeAny } from "../../../../utils/types";
import { Value } from "../../../../values/base";
import { ODataClientOptions } from "../../../client/odata-client";
import { EntitySelectExpand } from "../../expand/entity-select-expand";
import { EntitySetClient } from "../entity-set-client";
import { EntitySetClientImpl, EntitySetClientImplOptions } from "../entity-set-client.impl";
import { EntityKey, EntityKeyValue, EntityPropertyType, EntitySetBuilderAddKey, EntitySetBuilderAddMethod, EntitySetBuilderAddMethodFull, EntitySetBuilderAddValue } from "./entity-set-client-builder";

export interface EntitySetBuilderImplOptions {
  rootOptions: ODataClientOptions;
  entitySet: string;
}

export class EntitySetBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
> implements EntitySetBuilderAddKey<TEntity>,
  EntitySetBuilderAddValue<TEntity, TKey>,
  EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>
{
  private readonly options;

  constructor(
    options: EntitySetBuilderImplOptions,
  ) {
    this.options = options;
  }

  private key!: TKey;
  withKey<TKey extends EntityKey<TEntity>>(key: TKey): EntitySetBuilderAddValue<TEntity, TKey> {
    this.key = key as SafeAny;
    return this as SafeAny;
  }

  private keyType?: EntityKeyValue<EntityPropertyType<TEntity, TKey>>;
  withKeyType(builder: EntityKeyValue<EntityPropertyType<TEntity, TKey>>): EntitySetBuilderAddMethod<TEntity, TKey, undefined, undefined, undefined, undefined, undefined> {
    this.keyType = builder as SafeAny;
    return this as SafeAny;
  }

  private readSet?: HttpMethod;
  withReadSet<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TMethod, TRead, TCreate, TUpdate, TDelete> {
    this.readSet = method;
    return this as SafeAny;
  }

  private read?: HttpMethod;
  withRead<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TMethod, TCreate, TUpdate, TDelete> {
    this.read = method;
    return this as SafeAny;
  }

  private create?: HttpMethod;
  withCreate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TMethod, TUpdate, TDelete> {
    this.create = method;
    return this as SafeAny;
  }

  private update?: HttpMethod;
  withUpdate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TMethod, TDelete> {
    this.update = method;
    return this as SafeAny;
  }

  private delete?: HttpMethod;
  withDelete<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TMethod> {
    this.delete = method;
    return this as SafeAny;
  }

  private validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
  withValidator(validator: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true> {
    this.validator = validator;
    return this as SafeAny;
  }

  build(): EntitySetClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete> {
    const options: EntitySetClientImplOptions = {
      rootOptions: this.options.rootOptions,
      entitySet: this.options.entitySet,
      key: this.key,
      keyType: this.keyType as ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[],
      validator: this.validator,
      readSet: this.readSet,
      read: this.read,
      create: this.create,
      update: this.update,
      delete: this.delete,
    };

    return new EntitySetClientImpl<TEntity, TKey>(options);
  }
}
