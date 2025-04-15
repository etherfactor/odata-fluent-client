import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../entity/client/entity-set-client";
import { EntityInvokable, Invokable } from "../invokable";
import { EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal, ParameterValue } from "./invokable-builder";

export interface InvokableBuilderImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
}

export abstract class InvokableBuilderImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements InvokableBuilderAddMethod,
  InvokableBuilderAddParameters,
  InvokableBuilderAddReturnType<TParameter>,
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

  withCollectionResponse<TReturn>(): InvokableBuilderFinal<TParameter, true, TReturn> {
    this.isCollection = true;
    return this as SafeAny;
  }

  withSingleResponse<TReturn>(): InvokableBuilderFinal<TParameter, false, TReturn> {
    this.isCollection = false;
    return this as SafeAny;
  }
  
  abstract build(): Invokable<TParameter, TCollection, TReturn>;
}

export interface EntityInvokableBuilderImplOptions extends InvokableBuilderImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

export abstract class EntityInvokableBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements InvokableBuilderAddMethod,
  EntityInvokableBuilderAddParameters<TEntity, TKey>,
  EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>,
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

  withCollectionResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, true, TReturn> {
    this.isCollection = true;
    return this as SafeAny;
  }

  withSingleResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, false, TReturn> {
    this.isCollection = false;
    return this as SafeAny;
  }
  
  abstract build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn>;
}
