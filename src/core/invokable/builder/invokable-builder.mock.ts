import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySelectExpand } from "../../entity/expand/entity-select-expand";
import { EntityInvokable, Invokable } from "../invokable";
import { EntityInvokableBuilderAddMethod, EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, EntityInvokableBuilderFinalValidator, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal, InvokableBuilderFinalValidator } from "./invokable-builder";

export interface InvokableBuilderMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
}

/**
 * A builder for a mock invokable.
 */
export abstract class InvokableBuilderMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements InvokableBuilderAddMethod,
  InvokableBuilderAddParameters,
  InvokableBuilderAddReturnType<TParameter>,
  InvokableBuilderFinalValidator<TParameter, TCollection, TReturn>,
  InvokableBuilderFinal<TParameter, TCollection, TReturn>
{
  method: HttpMethod = "GET";

  abstract withDefaultMethod(): InvokableBuilderAddParameters;

  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters {
    this.method = method;
    return this as SafeAny;
  }

  isBody = false;

  withParameters<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = false;
    return this as SafeAny;
  }

  withBody<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = true;
    return this as SafeAny;
  }

  isCollection = false;

  withCollectionResponse<TReturn>(): InvokableBuilderFinalValidator<TParameter, true, TReturn> {
    this.isCollection = true;
    return this as SafeAny;
  }

  withSingleResponse<TReturn>(): InvokableBuilderFinalValidator<TParameter, false, TReturn> {
    this.isCollection = false;
    return this as SafeAny;
  }
  
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TReturn | Error;
  withValidator(validator: (value: unknown, selectExpand: EntitySelectExpand) => TReturn | Error): InvokableBuilderFinal<TParameter, TCollection, TReturn> {
    this.validator = validator;
    return this as SafeAny;
  }

  abstract build(): Invokable<TParameter, TCollection, TReturn>;
}

export interface EntityInvokableBuilderMockOptions extends InvokableBuilderMockOptions { }

/**
 * A builder for a mock invokable, targeting an entity.
 */
export abstract class EntityInvokableBuilderMock<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityInvokableBuilderAddMethod<TEntity, TKey>,
  EntityInvokableBuilderAddParameters<TEntity, TKey>,
  EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityInvokableBuilderFinalValidator<TEntity, TKey, TParameter, TCollection, TReturn>,
  EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  method: HttpMethod = "GET";
  
  abstract withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey>;

  withMethod<TMethod extends HttpMethod>(method: TMethod): EntityInvokableBuilderAddParameters<TEntity, TKey> {
    this.method = method;
    return this as SafeAny;
  }

  isBody = false;

  withParameters<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
    this.isBody = false;
    return this as SafeAny;
  }

  withBody<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
    this.isBody = true;
    return this as SafeAny;
  }

  isCollection = false;

  withCollectionResponse<TReturn>(): EntityInvokableBuilderFinalValidator<TEntity, TKey, TParameter, true, TReturn> {
    this.isCollection = true;
    return this as SafeAny;
  }

  withSingleResponse<TReturn>(): EntityInvokableBuilderFinalValidator<TEntity, TKey, TParameter, false, TReturn> {
    this.isCollection = false;
    return this as SafeAny;
  }
  
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TReturn | Error;
  withValidator(validator: (value: unknown, selectExpand: EntitySelectExpand) => TReturn | Error): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn> {
    this.validator = validator;
    return this as SafeAny;
  }
  
  abstract build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn>;
}
