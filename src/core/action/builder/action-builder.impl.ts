import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal } from "../../invokable/invokable-builder";
import { ActionImpl } from "../action.impl";
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

  method!: HttpMethod;
  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters {
    this.method = method;
    return this as SafeAny;
  }

  isBody = true;

  withParameters<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = false;
    return this as SafeAny;
  }

  withBody<TParameter extends {}>(): InvokableBuilderAddReturnType<TParameter> {
    this.isBody = true;
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
      isCollection: this.isCollection,
    });
  }
}

export interface EntityActionBuilderImplOptions extends ActionBuilderImplOptions { }

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

  method!: HttpMethod;
  withMethod<TMethod extends HttpMethod>(method: TMethod): InvokableBuilderAddParameters {
    this.method = method;
    return this as SafeAny;
  }

  withParameters<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
    return this as SafeAny;
  }

  withBody<TParameter extends {}>(): EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter> {
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
    throw new Error("Method not implemented.");
  }
}
