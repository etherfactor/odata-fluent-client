import { EntityInvokableMock, InvokableMock, InvokableMockOptions } from "../invokable/invokable.mock";
import { Action, EntityAction } from "./action";

export interface ActionMockOptions extends InvokableMockOptions { }

/**
 * A mock action.
 */
export class ActionMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableMock<TParameter, TCollection, TReturn>
  implements Action<TParameter, TCollection, TReturn>
{
  constructor(
    options: ActionMockOptions,
  ) {
    super(options);
  }

  getData(parameters: TParameter) {
    return this.options.rootOptions.actions[this.options.name].handler(undefined, parameters);
  }
}

export interface EntityActionMockOptions extends ActionMockOptions { }

/**
 * A mock action, targeting an entity set.
 */
export class EntityActionMock<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableMock<TKey, TParameter, TCollection, TReturn>
  implements EntityAction<TKey, TParameter, TCollection, TReturn>
{
  constructor(
    options: ActionMockOptions,
  ) {
    super(options);
  }

  getData(key: TKey, parameters: TParameter) {
    return this.options.rootOptions.actions[this.options.name].handler(key, parameters);
  }
}
