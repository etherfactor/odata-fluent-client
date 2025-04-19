import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokableBuilderAddParameters, InvokableBuilderAddParameters } from "../../invokable/builder/invokable-builder";
import { EntityInvokableBuilderMock, EntityInvokableBuilderMockOptions, InvokableBuilderMock, InvokableBuilderMockOptions } from "../../invokable/builder/invokable-builder.mock";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { ActionMock, EntityActionMock } from "../action.mock";
import { ActionBuilderAddMethod, ActionBuilderAddParameters, ActionBuilderAddReturnType, ActionBuilderFinal, EntityActionBuilderAddMethod, EntityActionBuilderAddParameters, EntityActionBuilderAddReturnType, EntityActionBuilderFinal } from "./action-builder";

export interface ActionBuilderMockOptions extends InvokableBuilderMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
}

/**
 * A builder for a mock action.
 */
export class ActionBuilderMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderMock<TParameter, TCollection, TReturn>
  implements ActionBuilderAddMethod,
  ActionBuilderAddParameters,
  ActionBuilderAddReturnType<TParameter>,
  ActionBuilderFinal<TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: ActionBuilderMockOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "POST";
    return this as SafeAny;
  }

  override build(): Invokable<TParameter, TCollection, TReturn> {
    return new ActionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}

export interface EntityActionBuilderMockOptions extends ActionBuilderMockOptions, EntityInvokableBuilderMockOptions { }

/**
 * A builder for a mock action, targeting an entity set.
 */
export class EntityActionBuilderMock<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderMock<TEntity, TKey, TParameter, TCollection, TReturn>
  implements EntityActionBuilderAddMethod<TEntity, TKey>,
  EntityActionBuilderAddParameters<TEntity, TKey>,
  EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityActionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityActionBuilderMockOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey> {
    this.method = "POST";
    return this as SafeAny;
  }

  override build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityActionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}
