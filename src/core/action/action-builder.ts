import { EntityKey } from "../entity/client/builder/entity-set-client-builder";
import { EntityInvokableBuilderAddMethod, EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal } from "../invokable/invokable-builder";

export interface ActionBuilderAddMethod extends InvokableBuilderAddMethod { }

export interface ActionBuilderAddParameters extends InvokableBuilderAddParameters { }

export interface ActionBuilderAddReturnType<
  TParameter extends {},
> extends InvokableBuilderAddReturnType<TParameter> { }

export interface ActionBuilderFinal<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderFinal<TParameter, TCollection, TReturn> { }

export interface EntityActionBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
> extends EntityInvokableBuilderAddMethod<TEntity, TKey> { }

export interface EntityActionBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> extends EntityInvokableBuilderAddParameters<TEntity, TKey> { }

export interface EntityActionBuilderAddReturnType<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
> extends EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> { }

export interface EntityActionBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn> { }
