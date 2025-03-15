import { AnyArray } from "../utils/types";
import { Value } from "../values/base";
import { EntityClient, EntityClientImpl, EntityKey, ResourceOptions } from "./entity/client";

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

  createEntityClient<TEntity, TKey extends EntityKey, TOptions extends ResourceOptions<TEntity, TKey>>(
    options: TOptions,
  ): EntityClient<TEntity, TKey, TOptions> {
    let adapter: HttpClientAdapter;
    if ("adapter" in this.config.http) {
      adapter = this.config.http.adapter;
    } else {
      adapter = DefaultHttpClientAdapter;
    }

    return new EntityClientImpl(options, adapter, this.config.serviceUrl, this.config.routingType);
  }
}

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
