import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../entity/client/entity-set-client";
import { EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal, ParameterValue } from "../../invokable/builder/invokable-builder";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { ActionImpl, EntityActionImpl } from "../action.impl";
import { ActionBuilderAddMethod, ActionBuilderAddParameters, ActionBuilderAddReturnType, ActionBuilderFinal, EntityActionBuilderAddParameters, EntityActionBuilderAddReturnType, EntityActionBuilderFinal } from "./action-builder";

export interface ActionBuilderImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
}

export class ActionBuilderImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements ActionBuilderAddMethod,
  ActionBuilderAddParameters,
  ActionBuilderAddReturnType<TParameter>,
  ActionBuilderFinal<TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: ActionBuilderImplOptions,
  ) {
    this.options = options;
  }

  method: HttpMethod = "POST";

  withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "POST";
    return this as SafeAny;
  }

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
  
  build(): Invokable<TParameter, TCollection, TReturn> {
    return new ActionImpl({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      method: this.method,
      isBody: this.isBody,
      values: this.values,
      converter: this.converter,
      isCollection: this.isCollection,
    });
  }
}

export interface EntityActionBuilderImplOptions extends ActionBuilderImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

export class EntityActionBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements ActionBuilderAddMethod,
  EntityActionBuilderAddParameters<TEntity, TKey>,
  EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityActionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityActionBuilderImplOptions,
  ) {
    this.options = options;
  }

  method: HttpMethod = "POST";

  withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "POST";
    return this as SafeAny;
  }

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
  
  build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityActionImpl({
      rootOptions: this.options.rootOptions,
      entitySet: this.options.entitySet,
      name: this.options.name,
      method: this.method,
      isBody: this.isBody,
      values: this.values,
      converter: this.converter,
      isCollection: this.isCollection,
    });
  }
}
