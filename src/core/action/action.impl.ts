import { SafeAny } from "../../utils/types";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { EntityInvokableImpl, EntityInvokableImplOptions, InvokableImpl, InvokableImplOptions } from "../invokable/invokable.impl";
import { Action, EntityAction } from "./action";

export interface ActionImplOptions extends InvokableImplOptions { }

/**
 * A physical action.
 */
export class ActionImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableImpl<TParameter, TCollection, TReturn>
  implements Action<TParameter, TCollection, TReturn>
{
  constructor(
    options: ActionImplOptions,
  ) {
    super(options);
  }
}

export interface EntityActionImplOptions extends ActionImplOptions, EntityInvokableImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

/**
 * A physical action, targeting an entity set.
 */
export class EntityActionImpl<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableImpl<TKey, TParameter, TCollection, TReturn>
  implements EntityAction<TKey, TParameter, TCollection, TReturn>
{
  constructor(
    options: EntityActionImplOptions,
  ) {
    super(options);
  }
}
