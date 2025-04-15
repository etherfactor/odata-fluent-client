import { HttpMethod } from "../../utils/http";
import { SafeAny } from "../../utils/types";
import { ODataClientOptions } from "../client/odata-client";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { ParameterValue } from "../invokable/builder/invokable-builder";
import { EntityInvokableImpl, EntityInvokableImplOptions, InvokableImpl, InvokableImplOptions } from "../invokable/invokable.impl";
import { EntityFunction, Function } from "./function";

export interface FunctionImplOptions extends InvokableImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
  method: HttpMethod;
  isBody: boolean;
  values?: ParameterValue<SafeAny>;
  converter?: (value: SafeAny) => SafeAny;
  isCollection: boolean;
}

export class FunctionImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableImpl<TParameter, TCollection, TReturn>
  implements Function<TParameter, TCollection, TReturn>
{
  constructor(
    options: FunctionImplOptions,
  ) {
    super(options);
  }
}

export interface EntityFunctionImplOptions extends FunctionImplOptions, EntityInvokableImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

export class EntityFunctionImpl<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableImpl<TKey, TParameter, TCollection, TReturn>
  implements EntityFunction<TKey, TParameter, TCollection, TReturn>
{
  constructor(
    options: EntityFunctionImplOptions,
  ) {
    super(options);
  }
}
