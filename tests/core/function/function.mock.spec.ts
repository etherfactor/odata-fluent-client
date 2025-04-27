import { MockODataClientOptions } from "../../../src";
import { EntitySetImpl } from "../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../src/core/entity/single/entity-single";
import { EntityFunctionMock, FunctionMock, FunctionMockOptions } from "../../../src/core/function/function.mock";

describe("FunctionMock", () => {
  let dummyRootOptions: MockODataClientOptions;
  beforeEach(() => {
    dummyRootOptions = {
      entitySets: {},
      actions: {},
      functions: {
        myFunction: {
          handler: jest.fn().mockImplementation((_key, params) => {
            return { result: params.value };
          }),
        },
      },
    };
  });

  it("should use createSingleWorker when isCollection is false", () => {
    const options: FunctionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myFunction",
      isCollection: false,
    };

    const functionMock = new FunctionMock(options);
    const params = { value: "testValue" };
    const result = functionMock.invoke(params);

    //Expect a single entity wrapper instance
    expect(result).toBeInstanceOf(EntitySingleImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "testValue" });

    expect(dummyRootOptions.functions.myFunction.handler).toHaveBeenCalledWith(undefined, params);
  });

  it("should use createSetWorker when isCollection is true", () => {
    const options: FunctionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myFunction",
      isCollection: true,
    };

    const functionMock = new FunctionMock(options);
    const params = { value: "collectionTest" };
    const result = functionMock.invoke(params);

    //Expect a collection wrapper instance
    expect(result).toBeInstanceOf(EntitySetImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "collectionTest" });

    expect(dummyRootOptions.functions.myFunction.handler).toHaveBeenCalledWith(undefined, params);
  });
});

describe("EntityFunctionMock", () => {
  let dummyRootOptions: MockODataClientOptions;
  beforeEach(() => {
    dummyRootOptions = {
      entitySets: {},
      actions: {},
      functions: {
        myEntityFunction: {
          handler: jest.fn().mockImplementation((key, params) => {
            return { result: `${key}_${params.value}` };
          }),
        },
      },
    };
  });

  it("should use createSingleWorker when isCollection is false", () => {
    const options: FunctionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myEntityFunction",
      isCollection: false,
    };

    const entityFunctionMock = new EntityFunctionMock(options);
    const key = "123";
    const params = { value: "entityTest" };
    const result = entityFunctionMock.invoke(key, params);

    //Expect a single entity wrapper instance
    expect(result).toBeInstanceOf(EntitySingleImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "123_entityTest" });

    expect(dummyRootOptions.functions.myEntityFunction.handler).toHaveBeenCalledWith(key, params);
  });

  it("should use createSetWorker when isCollection is true", () => {
    const options: FunctionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myEntityFunction",
      isCollection: true,
    };

    const entityFunctionMock = new EntityFunctionMock(options);
    const key = "456";
    const params = { value: "collectedValue" };
    const result = entityFunctionMock.invoke(key, params);

    //Expect a collection wrapper instance
    expect(result).toBeInstanceOf(EntitySetImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "456_collectedValue" });

    expect(dummyRootOptions.functions.myEntityFunction.handler).toHaveBeenCalledWith(key, params);
  });
});
