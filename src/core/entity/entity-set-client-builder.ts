import { HttpMethod } from "../../utils/http";
import { AnyArray, SafeAny } from "../../utils/types";
import { Value } from "../../values/base";
import { DefaultHttpClientAdapter, HttpClientAdapter } from "../http-client-adapter";
import { ODataClientConfig } from "../odata-client-config";
import { EntitySetClient, EntitySetClientImpl } from "./entity-set-client";
import { EntitySetClientOptions } from "./entity-set-client-options";

export interface EntitySetBuilderAddKey<TEntity> {
  withKey<TKey extends EntityKey<TEntity>>(key: TKey) : EntitySetBuilderAddValue<TEntity, TKey>;
}

export interface EntitySetBuilderAddValue<TEntity, TKey extends EntityKey<TEntity>> {
  withKeyType(builder: EntityKeyValue<EntityPropertyType<TEntity, TKey>>): EntitySetBuilderAddMethod<TEntity, TKey>;
}

interface EntitySetBuilderAddMethodFull<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
  TValidator extends true | undefined = undefined,
> {
  withReadSet<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TMethod, TRead, TCreate, TUpdate, TDelete, TValidator>;
  withRead<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TMethod, TCreate, TUpdate, TDelete, TValidator>;
  withCreate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TMethod, TUpdate, TDelete, TValidator>;
  withUpdate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TMethod, TDelete, TValidator>;
  withDelete<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TMethod, TValidator>;
  withValidator(validator: (value: unknown) => TEntity | Error): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true>;
  build(): EntitySetClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>;
}

export type EntitySetBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
  TValidator extends true | undefined = undefined,
> =
  (TReadSet extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withReadSet">) &
  (TRead extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withRead">) &
  (TCreate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withCreate">) &
  (TUpdate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withUpdate">) &
  (TDelete extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withDelete">) &
  (TValidator extends true ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "withValidator">) &
  Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator>, "build">;

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
  private readonly config: ODataClientConfig;
  private readonly entitySet: string;

  constructor(
    config: ODataClientConfig,
    entitySet: string,
  ) {
    this.config = config;
    this.entitySet = entitySet;
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

  private validator?: (value: unknown) => TEntity | Error;
  withValidator(validator: (value: unknown) => TEntity | Error): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true> {
    this.validator = validator;
    return this as SafeAny;
  }

  build(): EntitySetClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete> {
    let adapter: HttpClientAdapter;
    if ("adapter" in this.config.http) {
      adapter = this.config.http.adapter;
    } else {
      adapter = DefaultHttpClientAdapter;
    }

    const options: EntitySetClientOptions = {
      entitySet: this.entitySet,
      key: this.key,
      keyType: this.keyType as ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[],
      validator: this.validator,
      readSet: this.readSet,
      read: this.read,
      create: this.create,
      update: this.update,
      delete: this.delete,
    };

    return new EntitySetClientImpl<TEntity, TKey>(options, adapter, this.config.serviceUrl, this.config.routingType);
  }
}

export type EntityKey<TEntity> = keyof TEntity | [keyof TEntity, ...(keyof TEntity)[]];

export type EntityPropertyType<TEntity, TKey> =
  TKey extends (keyof TEntity)[]
    ? { [K in keyof TKey]: TKey[K] extends keyof TEntity ? TEntity[TKey[K]] : never }
    : TKey extends keyof TEntity
    ? TEntity[TKey]
    : never;

type EntityKeyValue<TKey> =
  TKey extends AnyArray
    ? { [K in keyof TKey]: (value: TKey[K]) => Value<TKey[K]> }
    : (value: TKey) => Value<TKey>;
