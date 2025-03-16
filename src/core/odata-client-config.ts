import { HttpClientAdapter } from "./http-client-adapter";

export type ODataPathRoutingType = "parentheses" | "slash";

export interface ODataClientConfig {
  http: ODataClientHttpRawOptions | ODataClientHttpClientOptions;
  serviceUrl: string;
  routingType: ODataPathRoutingType;
}

interface ODataClientHttpRawOptions {
  headers: Record<string, string>;
}

interface ODataClientHttpClientOptions {
  adapter: HttpClientAdapter;
}
