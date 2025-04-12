import { HttpMethod } from "../../utils/http";
import { SafeAny } from "../../utils/types";
import { Value } from "../../values/base";
import { EntityKey, EntityKeyType } from "../entity/client/builder/entity-set-client-builder";
import { EntityInvokable, Invokable } from "./invokable";

export interface InvokableBuilderAddMethod {
  withDefaultMethod(): InvokableBuilderAddParameters;
  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters;
}

export interface InvokableBuilderAddParameters {
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): InvokableBuilderAddReturnType<TParameter>;
  withBody<TParameter extends {}>(body?: (body: TParameter) => SafeAny): InvokableBuilderAddReturnType<TParameter>;
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
  withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey>;
  withMethod<TMethod extends HttpMethod>(method: TMethod): EntityInvokableBuilderAddParameters<TEntity, TKey>;
}

export interface EntityInvokableBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>;
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

export type ParameterValue<TParameter extends {}> = { [K in keyof TParameter]: (value: TParameter[K]) => Value<TParameter[K]> };
