import { EntityKey } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokableBuilderAddMethod, EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal } from "../../invokable/builder/invokable-builder";

export interface FunctionBuilderAddMethod extends InvokableBuilderAddMethod { }

export interface FunctionBuilderAddParameters extends InvokableBuilderAddParameters { }

export interface FunctionBuilderAddReturnType<
  TParameter extends {},
> extends InvokableBuilderAddReturnType<TParameter> { }

export interface FunctionBuilderFinal<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderFinal<TParameter, TCollection, TReturn> { }

export interface EntityFunctionBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
> extends EntityInvokableBuilderAddMethod<TEntity, TKey> { }

export interface EntityFunctionBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> extends EntityInvokableBuilderAddParameters<TEntity, TKey> { }

export interface EntityFunctionBuilderAddReturnType<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
> extends EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> { }

export interface EntityFunctionBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn> { }
