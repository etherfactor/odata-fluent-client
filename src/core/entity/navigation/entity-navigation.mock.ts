import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntitySetClient } from "../client/entity-set-client";
import { EntityNavigationAction, EntityNavigationFull } from "./entity-navigation";

export interface EntityNavigationClientMockOptions {
  rootOptions: MockODataClientOptions;
  navigation: string;
  fromSet: EntitySetClient<SafeAny, SafeAny, "GET", "GET", SafeAny, SafeAny, SafeAny>;
  toSet: EntitySetClient<SafeAny, SafeAny, "GET", "GET", SafeAny, SafeAny, SafeAny>;
  add?: HttpMethod;
  remove?: HttpMethod;
  set?: HttpMethod;
  unset?: HttpMethod;
}

/**
 * A mock navigation client.
 */
export class EntityNavigationClientMock<TKey1, TKey2> implements EntityNavigationFull<TKey1, TKey2> {

  private readonly options: EntityNavigationClientMockOptions;

  constructor(
    options: EntityNavigationClientMockOptions,
  ) {
    this.options = options;
  }

  add(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.add)
      throw new Error("This resource does not support adding navigations");

    return {
      execute: () => {
        const response = (async () => {
          const setOptions = this.options.rootOptions.entitySets[this.options.fromSet.name];
          if (!setOptions) {
            throw new Error(`Entity set ${this.options.fromSet.name} is not configured`);
          }
  
          const navOptions = setOptions.navigations?.[this.options.navigation];
  
          const fromSet = this.options.fromSet;
          const toSet = this.options.toSet;
  
          let fromEntity: SafeAny;
          let toEntity: SafeAny;
          
          fromEntity = await fromSet.read(from).execute().data;
          toEntity = await toSet.read(to).execute().data;

          fromEntity[this.options.navigation] ??= [];
          fromEntity[this.options.navigation].push(toEntity);
  
          if (navOptions && navOptions.onAdd) {
            navOptions.onAdd(fromEntity, toEntity);
          }
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

  remove(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.remove)
      throw new Error("This resource does not support removing navigations");

    return {
      execute: () => {
        const response = (async () => {
          const setOptions = this.options.rootOptions.entitySets[this.options.fromSet.name];
          if (!setOptions) {
            throw new Error(`Entity set ${this.options.fromSet.name} is not configured`);
          }
  
          const navOptions = setOptions.navigations?.[this.options.navigation];
  
          const fromSet = this.options.fromSet;
          const toSet = this.options.toSet;
  
          let fromEntity: SafeAny;
          let toEntity: SafeAny;
          
          fromEntity = await fromSet.read(from).execute().data;
          toEntity = await toSet.read(to).execute().data;
  
          fromEntity[this.options.navigation] ??= [];
          fromEntity[this.options.navigation] = fromEntity[this.options.navigation].filter((item: SafeAny) => item !== toEntity);

          if (navOptions && navOptions.onRemove) {
            navOptions.onRemove(fromEntity, toEntity);
          }
        })();

        return {
          response: response,
          result: response.then(
            () => true,
            () => false,
          ),
        }
      }
    };
  }

  set(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.set)
      throw new Error("This resource does not support setting navigations");

    return {
      execute: () => {
        const response = (async () => {
          const setOptions = this.options.rootOptions.entitySets[this.options.fromSet.name];
          if (!setOptions) {
            throw new Error(`Entity set ${this.options.fromSet.name} is not configured`);
          }
  
          const navOptions = setOptions.navigations?.[this.options.navigation];
  
          const fromSet = this.options.fromSet;
          const toSet = this.options.toSet;
  
          let fromEntity: SafeAny;
          let toEntity: SafeAny;
          
          fromEntity = await fromSet.read(from).execute().data;
          toEntity = await toSet.read(to).execute().data;
  
          fromEntity[this.options.navigation] = toEntity;
  
          if (navOptions && navOptions.onSet) {
            navOptions.onSet(fromEntity, toEntity);
          }
        })();

        return {
          response: response,
          result: response.then(
            () => true,
            () => false,
          ),
        }
      }
    };
  }

  unset(from: TKey1, to: TKey2): EntityNavigationAction {
    if (!this.options.unset)
      throw new Error("This resource does not support unsetting navigations");
    
    return {
      execute: () => {
        const response = (async () => {
          const setOptions = this.options.rootOptions.entitySets[this.options.fromSet.name];
          if (!setOptions) {
            throw new Error(`Entity set ${this.options.fromSet.name} is not configured`);
          }

          const navOptions = setOptions.navigations?.[this.options.navigation];

          const fromSet = this.options.fromSet;
          const toSet = this.options.toSet;

          let fromEntity: SafeAny;
          let toEntity: SafeAny;
          
          fromEntity = await fromSet.read(from).execute().data;
          toEntity = await toSet.read(to).execute().data;

          fromEntity[this.options.navigation] = null;

          if (navOptions && navOptions.onUnset) {
            navOptions.onUnset(fromEntity, toEntity);
          }
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
