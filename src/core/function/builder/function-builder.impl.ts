import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../entity/client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../entity/client/entity-set-client";
import { InvokableBuilderAddParameters } from "../../invokable/builder/invokable-builder";
import { EntityInvokableBuilderImpl, EntityInvokableBuilderImplOptions, InvokableBuilderImpl, InvokableBuilderImplOptions } from "../../invokable/builder/invokable-builder.impl";
import { EntityInvokable, Invokable } from "../../invokable/invokable";
import { EntityFunctionImpl, FunctionImpl } from "../function.impl";
import { EntityFunctionBuilderAddParameters, EntityFunctionBuilderAddReturnType, EntityFunctionBuilderFinal, FunctionBuilderAddMethod, FunctionBuilderAddParameters, FunctionBuilderAddReturnType, FunctionBuilderFinal } from "./function-builder";

export interface FunctionBuilderImplOptions extends InvokableBuilderImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
}

/**
 * A builder for a physical function.
 */
export class FunctionBuilderImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableBuilderImpl<TParameter, TCollection, TReturn>
  implements FunctionBuilderAddMethod,
  FunctionBuilderAddParameters,
  FunctionBuilderAddReturnType<TParameter>,
  FunctionBuilderFinal<TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: FunctionBuilderImplOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "GET";
    return this as SafeAny;
  }

  override build(): Invokable<TParameter, TCollection, TReturn> {
    return new FunctionImpl({
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

export interface EntityFunctionBuilderImplOptions extends FunctionBuilderImplOptions, EntityInvokableBuilderImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

/**
 * A builder for a physical function, targeting an entity set.
 */
export class EntityFunctionBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableBuilderImpl<TEntity, TKey, TParameter, TCollection, TReturn>
  implements FunctionBuilderAddMethod,
  EntityFunctionBuilderAddParameters<TEntity, TKey>,
  EntityFunctionBuilderAddReturnType<TEntity, TKey, TParameter>,
  EntityFunctionBuilderFinal<TEntity, TKey, TParameter, TCollection, TReturn>
{
  private readonly options;

  constructor(
    options: EntityFunctionBuilderImplOptions,
  ) {
    super();
    this.options = options;
  }

  override withDefaultMethod(): InvokableBuilderAddParameters {
    this.method = "GET";
    return this as SafeAny;
  }

  override build(): EntityInvokable<EntityKeyType<TEntity, TKey>, TParameter, TCollection, TReturn> {
    return new EntityFunctionImpl({
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
