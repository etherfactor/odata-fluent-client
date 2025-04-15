import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokable, Invokable } from "../invokable";
import { EntityInvokableBuilderAddMethod, EntityInvokableBuilderAddParameters, EntityInvokableBuilderAddReturnType, EntityInvokableBuilderFinal, InvokableBuilderAddMethod, InvokableBuilderAddParameters, InvokableBuilderAddReturnType, InvokableBuilderFinal } from "./invokable-builder";

export interface InvokableBuilderMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
}

export abstract class InvokableBuilderMock<
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
  
  abstract build(): Invokable<TParameter, TCollection, TReturn>;
}

export interface EntityInvokableBuilderMockOptions extends InvokableBuilderMockOptions { }

export abstract class EntityInvokableBuilderMock<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityInvokableBuilderAddMethod<TEntity, TKey>,
  EntityInvokableBuilderAddParameters<TEntity, TKey>,
  EntityInvokableBuilderAddReturnType<TEntity, TKey, TParameter>,
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
