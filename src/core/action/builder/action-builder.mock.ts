import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal } from "../../invokable/builder/invokable-builder";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { ActionMock, EntityActionMock } from "../action.mock";
import { ActionBuilderAddMethod, ActionBuilderAddParameters, ActionBuilderAddReturnType, ActionBuilderFinal, EntityActionBuilderAddMethod, EntityActionBuilderAddParameters, EntityActionBuilderAddReturnType, EntityActionBuilderFinal } from "./action-builder";

export interface ActionBuilderMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
}

export class ActionBuilderMock<
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
    options: ActionBuilderMockOptions,
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
    return new ActionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}

export interface EntityActionBuilderMockOptions extends ActionBuilderMockOptions { }

export class EntityActionBuilderMock<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityActionBuilderAddMethod<TEntity, TKey>,
  EntityActionBuilderAddParameters<TEntity, TKey>,
  EntityActionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityActionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityActionBuilderMockOptions,
  ) {
    this.options = options;
  }

  method: HttpMethod = "POST";
  
  withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey> {
    this.method = "POST";
    return this as SafeAny;
  }

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

  withCollectionResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, true, TReturn> {
    this.isCollection = true;
    return this as SafeAny;
  }

  withSingleResponse<TReturn>(): EntityInvokableBuilderFinal<TEntity, TKey, TParameter, false, TReturn> {
    this.isCollection = false;
    return this as SafeAny;
  }
  
  build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityActionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}
