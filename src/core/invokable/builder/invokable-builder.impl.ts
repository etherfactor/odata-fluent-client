import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../entity/client/entity-set-client";
import { EntitySelectExpand } from "../../entity/expand/entity-select-expand";
import { EntityInvokable, Invokable } from "../invokable";
import { EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, EntityInvokableBuilderFinalValidator, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal, InvokableBuilderFinalValidator, ParameterValue } from "./invokable-builder";

export interface InvokableBuilderImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
}

/**
 * A builder for a physical invokable.
 */
export abstract class InvokableBuilderImpl<
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

  isBody = true;

  values?: ParameterValue<TParameter>;
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = false;
    this.values = values as SafeAny;
    return this as SafeAny;
  }

  converter?: (body: TParameter) => SafeAny;
  withBody<TParameter extends {}>(body?: (body: TParameter) => SafeAny): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = true;
    this.converter = body as SafeAny;
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

export interface EntityInvokableBuilderImplOptions extends InvokableBuilderImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

/**
 * A builder for a physical invokable, targeting an entity.
 */
export abstract class EntityInvokableBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements InvokableBuilderAddMethod,
  EntityInvokableBuilderAddParameters<TEntity, TKey>,
  EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityInvokableBuilderFinalValidator<TEntity, TKey, TParameter, TCollection, TReturn>,
  EntityInvokableBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  method: HttpMethod = "POST";

  abstract withDefaultMethod(): InvokableBuilderAddParameters;

  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters {
    this.method = method;
    return this as SafeAny;
  }

  isBody = false;

  values?: ParameterValue<TParameter>;
  withParameters<TParameter extends {}>(values: ParameterValue<TParameter>): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
    this.isBody = false;
    this.values = values as SafeAny;
    return this as SafeAny;
  }

  converter?: (body: TParameter) => SafeAny;
  withBody<TParameter extends {}>(body?: (body: TParameter) => SafeAny): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
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
