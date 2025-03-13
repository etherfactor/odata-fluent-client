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

  createEntityClient<TEntity, TOptions extends ResourceOptions>(
    entity: Partial<TEntity>,
    options: TOptions,
  ): EntityClient<TEntity, TOptions> {
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
  data: Promise<unknown>;
  stream: AsyncIterable<string>;
}

const DefaultHttpClientAdapter: HttpClientAdapter = {
  invoke: async function (config: HttpRequestData): Promise<HttpResponseData> {
    const result = await fetch(
      config.url,
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
      data: result.json(),
      stream: iterable,
    };
  }
}

const emptyIterable = {
  async *[Symbol.asyncIterator]() {
    yield "";
  }
}
