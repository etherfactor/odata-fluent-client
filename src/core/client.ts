import { HttpMethod } from "../utils/http";
import { AnyArray, SafeAny } from "../utils/types";
import { Value } from "../values/base";
import { EntityClient, EntityClientImpl, ResourceOptions } from "./entity/client";

export interface ODataClientConfig {
  http: ODataClientHttpRawOptions | ODataClientHttpClientOptions;
  serviceUrl: string;
  routingType: RoutingType;
}

export class ODataClient {
  private readonly config;
  
  constructor(
    config: ODataClientConfig,
  ) {
    this.config = config;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl(this.config, name);
  }
}

interface EntitySetBuilderAddKey<TEntity> {
  withKey<TKey extends EntityKey<TEntity>>(key: TKey) : EntitySetBuilderAddValue<TEntity, TKey>;
}

interface EntitySetBuilderAddValue<TEntity, TKey extends EntityKey<TEntity>> {
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
> {
  withReadSet<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TMethod, TRead, TCreate, TUpdate, TDelete>;
  withRead<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TMethod, TCreate, TUpdate, TDelete>;
  withCreate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TMethod, TUpdate, TDelete>;
  withUpdate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TMethod, TDelete>;
  withDelete<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TMethod>;
  build(): EntityClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>;
}

type EntitySetBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
> =
  (TReadSet extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "withReadSet">) &
  (TRead extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "withRead">) &
  (TCreate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "withCreate">) &
  (TUpdate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "withUpdate">) &
  (TDelete extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "withDelete">) &
  Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>, "build">;

class EntitySetBuilderImpl<
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

  build(): EntityClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete> {
    let adapter: HttpClientAdapter;
    if ("adapter" in this.config.http) {
      adapter = this.config.http.adapter;
    } else {
      adapter = DefaultHttpClientAdapter;
    }

    const options: ResourceOptions = {
      entitySet: this.entitySet,
      key: this.key,
      keyType: this.keyType as ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[],
      readSet: this.readSet,
      read: this.read,
      create: this.create,
      update: this.update,
      delete: this.delete,
    };

    return new EntityClientImpl<TEntity, TKey>(options, adapter, this.config.serviceUrl, this.config.routingType);
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

export interface HttpModelValidator<TEntity> {
  validate(data: unknown): data is TEntity;
}

export type RoutingType = "parentheses" | "slash";

interface ODataClientHttpRawOptions {
  headers: Record<string, string>;
}

interface ODataClientHttpClientOptions {
  adapter: HttpClientAdapter;
}

export interface HttpClientAdapter {
  invoke(config: HttpRequestData): Promise<HttpResponseData>;
}

export interface HttpRequestData {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: any;
}

export interface HttpResponseData {
  status: number;
  data: Promise<unknown> | AsyncIterable<string>;
}

const DefaultHttpClientAdapter: HttpClientAdapter = {
  invoke: async function (config: HttpRequestData): Promise<HttpResponseData> {
    console.log(config);
    let urlAndQuery = config.url;
    if (config.query && Object.keys(config.query).length > 0) {
      const query = Object.keys(config.query)
        .map(key => `${key}=${encodeURIComponent(config.query[key])}`)
        .join("&");

      urlAndQuery = `${config.url}?${query}`;
    }

    const result = await fetch(
      urlAndQuery,
      {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      }
    );

    const decoder = new TextDecoder();
    const reader = result.body?.getReader();
    const iterable: AsyncIterable<string> = reader ? {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader.read();
          yield decoder.decode(value);
          if (done) break;
        }
      }
    } : emptyIterable;

    return {
      status: result.status,
      data: iterable,
    };
  }
}

const emptyIterable = {
  async *[Symbol.asyncIterator]() {
    yield "";
  }
}
