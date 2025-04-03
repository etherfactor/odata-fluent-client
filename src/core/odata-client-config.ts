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

export interface MockODataClientConfig {
  mockData: Record<string, object[]>;
}

export function isMockConfig(config: ODataClientConfig | MockODataClientConfig): config is MockODataClientConfig {
  return "mockData" in config;
}
