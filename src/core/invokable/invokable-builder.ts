import { HttpMethod } from "../../utils/http";
import { EntityKey, EntityKeyType } from "../entity/client/builder/entity-set-client-builder";
import { EntityInvokable, Invokable } from "./invokable";

export interface InvokableBuilderAddMethod {
  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters;
}

export interface InvokableBuilderAddParameters {
  withParameters<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter>;
  withBody<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter>;
}

export interface InvokableBuilderAddReturnType<
  TParameter extends {},
> {
  withReturnType<TReturn>(): InvokableBuilderFinal<TParameter, TReturn>;
}

export interface InvokableBuilderFinal<
  TParameter extends {},
  TReturn,
> {
  build(): Invokable<TParameter, TReturn>;
}

export interface EntityInvokableBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  withMethod<TMethod extends HttpMethod>(method: TMethod): EntityInvokableBuilderAddParameters<TEntity, TKey>;
}

export interface EntityInvokableBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  withParameters<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>;
  withBody<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>;
}

export interface EntityInvokableBuilderAddReturnType<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
> {
  withReturnType<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TReturn>;
}

export interface EntityInvokableBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TReturn,
> {
  build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TReturn>;
}
