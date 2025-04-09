import { HttpMethod } from "../../utils/http";
import { EntityKey, EntityKeyType } from "../entity/client/builder/entity-set-client-builder";
import { Action, EntityAction } from "./action";

export interface ActionBuilderAddMethod {
  withMethod<TMethod extends HttpMethod>(method: TMethod): ActionBuilderAddParameters;
}

export interface ActionBuilderAddParameters {
  withParameters<TParameter extends {}>(): ActionBuilderAddReturnType<TParameter>;
  withBody<TParameter extends {}>(): ActionBuilderAddReturnType<TParameter>;
}

export interface ActionBuilderAddReturnType<
  TParameter extends {},
> {
  withReturnType<TReturn>(): ActionBuilderFinal<TParameter, TReturn>;
}

export interface ActionBuilderFinal<
  TParameter extends {},
  TReturn,
> {
  build(): Action<TParameter, TReturn>;
}

export interface EntityActionBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  withMethod<TMethod extends HttpMethod>(method: TMethod): EntityActionBuilderAddParameters<TEntity, TKey>;
}

export interface EntityActionBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  withParameters<TParameter extends {}>(): EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>;
  withBody<TParameter extends {}>(): EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>;
}

export interface EntityActionBuilderAddReturnType<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
> {
  withReturnType<TReturn>(): EntityActionBuilderFinal<TEntity, TKey, TParameter, TReturn>;
}

export interface EntityActionBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TReturn,
> {
  build(): EntityAction<EntityKeyType<TEntity, TKey>, TParameter, TReturn>;
}
