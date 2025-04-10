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
  withCollectionResponse<TReturn>(): InvokableBuilderFinal<TParameter, true, TReturn>;
  withSingleResponse<TReturn>(): InvokableBuilderFinal<TParameter, false, TReturn>;
}

export interface InvokableBuilderFinal<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  build(): Invokable<TParameter, TCollection, TReturn>;
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
  withCollectionResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, true, TReturn>;
  withSingleResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, false, TReturn>;
}

export interface EntityInvokableBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn>;
}
