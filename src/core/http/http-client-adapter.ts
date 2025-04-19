/**
 * An adapter for executing HTTP requests and returning a response.
 */
export interface HttpClientAdapter {
  invoke(config: HttpRequestData): Promise<HttpResponseData>;
}

/**
 * Contains the properties of the HTTP request that needs to be sent.
 */
export interface HttpRequestData {
  /**
   * The method being invoked.
   */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /**
   * The url of the endpoint.
   */
  url: string;
  /**
   * The headers to apply.
   */
  headers: Record<string, string>;
  /**
   * The query options to apply.
   */
  query: Record<string, string>;
  /**
   * The body to send, if any.
   */
  body?: any;
}

/**
 * The returned HTTP response.
 */
export interface HttpResponseData {
  /**
   * The HTTP status code.
   */
  status: number;
  /**
   * Either a promise returning the entire response object, or an iterable returning the response in string chunks as it becomes available.
   */
  data: Promise<unknown> | AsyncIterable<string>;
}

/**
 * The default HTTP client adapter, which relies on {@link fetch}.
 */
export const DefaultHttpClientAdapter: HttpClientAdapter = {
  invoke: async function (config: HttpRequestData): Promise<HttpResponseData> {
    let urlAndQuery = config.url;

    //If the request has any query options, encode them and append them
    if (config.query && Object.keys(config.query).length > 0) {
      const query = Object.keys(config.query)
        .map(key => `${key}=${encodeURIComponent(config.query[key])}`)
        .join("&");

      urlAndQuery = `${config.url}?${query}`;
    }

    //Create the base request for fetch
    const options: RequestInit = {
      method: config.method,
      headers: config.body ? { ...config.headers, "content-type": "application/json" } : config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    };

    //Invoke the request
    const result = await fetch(
      urlAndQuery,
      options,
    );

    //Read the response in string chunks as it becomes available. I'm not sure how useful streaming will be in practice,
    //but I guess it's already set up for it and shouldn't hurt anyway
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

/**
 * A fallback iterable, if the body doesn't exist for whatever reason.
 */
const emptyIterable = {
  async *[Symbol.asyncIterator]() {
    yield "";
  }
}
