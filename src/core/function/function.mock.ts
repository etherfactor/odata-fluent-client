import { MockODataClientOptions } from "../client/odata-client.mock";
import { EntityInvokableMock, InvokableMock, InvokableMockOptions } from "../invokable/invokable.mock";
import { EntityFunction, Function } from "./function";

export interface FunctionMockOptions extends InvokableMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
  isCollection: boolean;
}

/**
 * A mock function.
 */
export class FunctionMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends InvokableMock<TParameter, TCollection, TReturn>
  implements Function<TParameter, TCollection, TReturn>
{
  constructor(
    options: FunctionMockOptions,
  ) {
    super(options);
  }

  getData(parameters: TParameter) {
    return this.options.rootOptions.functions[this.options.name].handler(undefined, parameters);
  }
}

export interface EntityFunctionMockOptions extends FunctionMockOptions { }

/**
 * A mock function, targeting an entity set.
 */
export class EntityFunctionMock<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> extends EntityInvokableMock<TKey, TParameter, TCollection, TReturn>
  implements EntityFunction<TKey, TParameter, TCollection, TReturn>
{
  constructor(
    options: FunctionMockOptions,
  ) {
    super(options);
  }

  getData(key: TKey, parameters: TParameter) {
    return this.options.rootOptions.functions[this.options.name].handler(key, parameters);
  }
}
