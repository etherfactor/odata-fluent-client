import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../entity/client/entity-set-client";
import { InvokableBuilderAddParameters } from "../../invokable/builder/invokable-builder";
import { EntityInvokableBuilderImpl, EntityInvokableBuilderImplOptions, InvokableBuilderImpl, InvokableBuilderImplOptions } from "../../invokable/builder/invokable-builder.impl";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { ActionImpl, EntityActionImpl } from "../action.impl";
import { ActionBuilderAddMethod, ActionBuilderAddParameters, ActionBuilderAddReturnType, ActionBuilderFinal, EntityActionBuilderAddParameters, EntityActionBuilderAddReturnType, EntityActionBuilderFinal } from "./action-builder";

export interface ActionBuilderImplOptions extends InvokableBuilderImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
}

/**
 * A builder for a physical action.
 */
export class ActionBuilderImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderImpl<TParameter, TCollection, TReturn>
  implements ActionBuilderAddMethod,
  ActionBuilderAddParameters,
  ActionBuilderAddReturnType<TParameter>,
  ActionBuilderFinal<TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: ActionBuilderImplOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "POST";
    return this as SafeAny;
  }

  override build(): Invokable<TParameter, TCollection, TReturn> {
    return new ActionImpl({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      method: this.method,
      isBody: this.isBody,
      values: this.values,
      converter: this.converter,
      isCollection: this.isCollection,
    });
  }
}

export interface EntityActionBuilderImplOptions extends ActionBuilderImplOptions, EntityInvokableBuilderImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

/**
 * A builder for a physical action, targeting an entity set.
 */
export class EntityActionBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderImpl<TEntity, TKey, TParameter, TCollection, TReturn>
  implements ActionBuilderAddMethod,
  EntityActionBuilderAddParameters<TEntity, TKey>,
  EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityActionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityActionBuilderImplOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "POST";
    return this as SafeAny;
  }

  override build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityActionImpl({
      rootOptions: this.options.rootOptions,
      entitySet: this.options.entitySet,
      name: this.options.name,
      method: this.method,
      isBody: this.isBody,
      values: this.values,
      converter: this.converter,
      isCollection: this.isCollection,
    });
  }
}
