import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { Value } from "../../../values/base";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokable, Invokable } from "../invokable";

export interface InvokableBuilderAddMethod {
  /**
   * Use the default method for this invokable.
   */
  withDefaultMethod(): InvokableBuilderAddParameters;
  /**
   * Specify a method for this invokable.
   * @param method The method to call.
   */
  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters;
}

export interface InvokableBuilderAddParameters {
  /**
   * Indicates that parameters should be passed via url.
   * @param values An object containing o.type mappings for your parameters.
   */
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): InvokableBuilderAddReturnType<TParameter>;
  /**
   * Indicates that parameters should be passed via body.
   * @param body The content to send in the body.
   */
  withBody<TParameter extends {}>(body?: (body: TParameter) => SafeAny): InvokableBuilderAddReturnType<TParameter>;
}

export interface InvokableBuilderAddReturnType<
  TParameter extends {},
> {
  /**
   * Indicates that the invokable returns multiple items.
   */
  withCollectionResponse<TReturn>(): InvokableBuilderFinal<TParameter, true, TReturn>;
  /**
   * Indicates that the invokable returns exactly one item.
   */
  withSingleResponse<TReturn>(): InvokableBuilderFinal<TParameter, false, TReturn>;
}

export interface InvokableBuilderFinal<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  /**
   * Builds the invokable.
   */
  build(): Invokable<TParameter, TCollection, TReturn>;
}

export interface EntityInvokableBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  /**
   * Use the default method for this invokable.
   */
  withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey>;
  /**
   * Specify a method for this invokable.
   * @param method The method to call.
   */
  withMethod<TMethod extends HttpMethod>(method: TMethod): EntityInvokableBuilderAddParameters<TEntity, TKey>;
}

export interface EntityInvokableBuilderAddParameters<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  /**
   * Indicates that parameters should be passed via url.
   * @param values An object containing o.type mappings for your parameters.
   */
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>;
  /**
   * Indicates that parameters should be passed via body.
   * @param body The content to send in the body.
   */
  withBody<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>;
}

export interface EntityInvokableBuilderAddReturnType<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
> {
  /**
   * Indicates that the invokable returns multiple items.
   */
  withCollectionResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, true, TReturn>;
  /**
   * Indicates that the invokable returns exactly one item.
   */
  withSingleResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, false, TReturn>;
}

export interface EntityInvokableBuilderFinal<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  /**
   * Builds the invokable.
   */
  build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn>;
}

export type ParameterValue<TParameter extends {}> = { [K in keyof TParameter]: (value: TParameter[K]) => Value<TParameter[K]> };
