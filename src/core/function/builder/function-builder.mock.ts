import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntityInvokableBuilderAddParameters, InvokableBuilderAddParameters } from "../../invokable/builder/invokable-builder";
import { EntityInvokableBuilderMock, EntityInvokableBuilderMockOptions, InvokableBuilderMock, InvokableBuilderMockOptions } from "../../invokable/builder/invokable-builder.mock";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { EntityFunctionMock, FunctionMock } from "../function.mock";
import { EntityFunctionBuilderAddMethod, EntityFunctionBuilderAddParameters, EntityFunctionBuilderAddReturnType, EntityFunctionBuilderFinal, FunctionBuilderAddMethod, FunctionBuilderAddParameters, FunctionBuilderAddReturnType, FunctionBuilderFinal } from "./function-builder";

export interface FunctionBuilderMockOptions extends InvokableBuilderMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
}

export class FunctionBuilderMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderMock<TParameter, TCollection, TReturn>
  implements FunctionBuilderAddMethod,
  FunctionBuilderAddParameters,
  FunctionBuilderAddReturnType<TParameter>,
  FunctionBuilderFinal<TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: FunctionBuilderMockOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "GET";
    return this as SafeAny;
  }

  override build(): Invokable<TParameter, TCollection, TReturn> {
    return new FunctionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}

export interface EntityFunctionBuilderMockOptions extends FunctionBuilderMockOptions, EntityInvokableBuilderMockOptions { }

export class EntityFunctionBuilderMock<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderMock<TEntity, TKey, TParameter, TCollection, TReturn>
  implements EntityFunctionBuilderAddMethod<TEntity, TKey>,
  EntityFunctionBuilderAddParameters<TEntity, TKey>,
  EntityFunctionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityFunctionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityFunctionBuilderMockOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): EntityInvokableBuilderAddParameters<TEntity, TKey> {
    this.method = "GET";
    return this as SafeAny;
  }

  override build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityFunctionMock({
      rootOptions: this.options.rootOptions,
      name: this.options.name,
      isCollection: this.isCollection,
    });
  }
}
