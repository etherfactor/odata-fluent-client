import { extendUrl, HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { DefaultHttpClientAdapter } from "../../http/http-client-adapter";
import { EntitySetClient } from "../client/entity-set-client";
import { EntitySetClientImplOptions, extendEntityUrl } from "../client/entity-set-client.impl";
import { EntityNavigationAction, EntityNavigationFull } from "./entity-navigation";

export interface EntityNavigationClientImplOptions {
  rootOptions: ODataClientOptions;
  navigation: string;
  fromSet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  toSet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  add?: HttpMethod;
  remove?: HttpMethod;
  set?: HttpMethod;
  unset?: HttpMethod;
}

/**
 * A physical navigation client.
 */
export class EntityNavigationClientImpl<TKey1, TKey2> implements EntityNavigationFull<TKey1, TKey2> {
  
  private readonly options: EntityNavigationClientImplOptions;

  private readonly fromSetOptions: EntitySetClientImplOptions;
  private readonly fromEntitySetUrl: string;
  
  private readonly toSetOptions: EntitySetClientImplOptions;
  private readonly toEntitySetUrl: string;

  constructor(
    options: EntityNavigationClientImplOptions,
  ) {
    this.options = options;

    this.fromSetOptions = (this.options.fromSet as SafeAny).options;
    this.fromEntitySetUrl = extendUrl(this.options.rootOptions.serviceUrl, this.fromSetOptions.entitySet);

    this.toSetOptions = (this.options.toSet as SafeAny).options;
    this.toEntitySetUrl = extendUrl(this.options.rootOptions.serviceUrl, this.toSetOptions.entitySet);
  }
  
  add(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.add)
      throw new Error("This resource does not support adding navigations");

    const fromEntityUrl = extendEntityUrl(this.fromEntitySetUrl, this.options.rootOptions.routingType, this.fromSetOptions.key, from, this.fromSetOptions.keyType);
    const fromNavUrl = extendUrl(fromEntityUrl, this.options.navigation, "$ref");

    const toEntityUrl = extendEntityUrl(this.toEntitySetUrl, this.options.rootOptions.routingType, this.toSetOptions.key, to, this.toSetOptions.keyType);

    return this.generateResponse(
      this.options.add,
      fromNavUrl,
      toEntityUrl,
      {},
      { "@odata.id": toEntityUrl },
    );
  }

  remove(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.remove)
      throw new Error("This resource does not support removing navigations");

    const fromEntityUrl = extendEntityUrl(this.fromEntitySetUrl, this.options.rootOptions.routingType, this.fromSetOptions.key, from, this.fromSetOptions.keyType);
    const fromNavUrl = extendUrl(fromEntityUrl, this.options.navigation, "$ref");

    const toEntityUrl = extendEntityUrl(this.toEntitySetUrl, this.options.rootOptions.routingType, this.toSetOptions.key, to, this.toSetOptions.keyType);

    return this.generateResponse(
      this.options.remove,
      fromNavUrl,
      toEntityUrl,
      { "$id": toEntityUrl },
      {},
    );
  }

  set(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.set)
      throw new Error("This resource does not support setting navigations");

    const fromEntityUrl = extendEntityUrl(this.fromEntitySetUrl, this.options.rootOptions.routingType, this.fromSetOptions.key, from, this.fromSetOptions.keyType);
    const fromNavUrl = extendUrl(fromEntityUrl, this.options.navigation, "$ref");

    const toEntityUrl = extendEntityUrl(this.toEntitySetUrl, this.options.rootOptions.routingType, this.toSetOptions.key, to, this.toSetOptions.keyType);

    return this.generateResponse(
      this.options.set,
      fromNavUrl,
      toEntityUrl,
      {},
      { "@odata.id": toEntityUrl },
    );
  }

  unset(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.unset)
      throw new Error("This resource does not support unsetting navigations");

    const fromEntityUrl = extendEntityUrl(this.fromEntitySetUrl, this.options.rootOptions.routingType, this.fromSetOptions.key, from, this.fromSetOptions.keyType);
    const fromNavUrl = extendUrl(fromEntityUrl, this.options.navigation, "$ref");

    const toEntityUrl = extendEntityUrl(this.toEntitySetUrl, this.options.rootOptions.routingType, this.toSetOptions.key, to, this.toSetOptions.keyType);

    return this.generateResponse(
      this.options.unset,
      fromNavUrl,
      toEntityUrl,
      {},
      {},
    );
  }

  /**
   * Builds a response for the action. Mostly just to reduce repeating the same code.
   */
  private generateResponse(method: HttpMethod, fromUrl: string, toUrl: string, query: SafeAny, body: SafeAny) {
    return {
      execute: () => {
        const adapter = this.options.rootOptions.http.adapter ?? DefaultHttpClientAdapter;
        const result = adapter.invoke({
          method: method,
          url: fromUrl,
          headers: this.options.rootOptions.http.headers ?? {},
          query: query,
          body: body,
        });

        const response = (async () => {
          await (await result).data;
        })();

        return {
          response: response,
          result: response.then(
            () => true,
            () => false,
          ),
        };
      }
    };
  }
}
