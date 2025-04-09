import { SafeAny } from "../../utils/types";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderImpl } from "../entity/client/builder/entity-set-client-builder.impl";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { Navigation } from "../entity/client/navigation/entity-navigation";
import { NavigationBuilderAddCardinality } from "../entity/client/navigation/entity-navigation-builder";
import { HttpClientAdapter } from "../http/http-client-adapter";

export interface ODataClientOptions {
  http: ODataClientHttpOptions;
  serviceUrl: string;
  routingType: ODataPathRoutingType;
}

export type ODataPathRoutingType = "parentheses" | "slash";

interface ODataClientHttpOptions {
  adapter?: HttpClientAdapter;
  headers?: Record<string, string>;
}

export class ODataClient {
  private readonly options;
  
  constructor(
    options: ODataClientOptions,
  ) {
    this.options = options;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl(this.options, name);
  }

  navigation<TEntity, TKey extends EntityKey<TEntity>, TNavProperty extends keyof TEntity & string>(
    fromSet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
    property: TNavProperty
  ): NavigationBuilderAddCardinality<TEntity, TKey, TNavProperty> {
    return undefined!;
  }

  readonly bind = {
    navigation: navigation,
  };
}

function navigation<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TSet extends EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TNavigation extends { [key: string]: Navigation<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  navigation: TNavigation,
): TSet & { navigation: TNavigation } {
  return undefined!;
};
