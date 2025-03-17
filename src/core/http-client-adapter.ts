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

export const DefaultHttpClientAdapter: HttpClientAdapter = {
  invoke: async function (config: HttpRequestData): Promise<HttpResponseData> {
    let urlAndQuery = config.url;
    if (config.query && Object.keys(config.query).length > 0) {
      const query = Object.keys(config.query)
        .map(key => `${key}=${encodeURIComponent(config.query[key])}`)
        .join("&");

      urlAndQuery = `${config.url}?${query}`;
    }

    const options: RequestInit = {
      method: config.method,
      headers: config.body ? { ...config.headers, "content-type": "application/json" } : config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    };

    const result = await fetch(
      urlAndQuery,
      options,
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
