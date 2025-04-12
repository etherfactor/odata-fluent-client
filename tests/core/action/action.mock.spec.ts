import { ActionMock, ActionMockOptions, EntityActionMock } from "../../../src/core/action/action.mock";
import { MockODataClientOptions } from "../../../src/core/client/odata-client.mock";
import { EntitySetImpl } from "../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../src/core/entity/single/entity-single";

describe("ActionMock", () => {
  let dummyRootOptions: MockODataClientOptions;
  beforeEach(() => {
    dummyRootOptions = {
      entitySets: {},
      actions: {
        myAction: {
          handler: jest.fn().mockImplementation((_key, params) => {
            return { result: params.value };
          }),
        },
      },
      functions: {},
    };
  });

  it("should use createSingleWorker when isCollection is false", () => {
    const options: ActionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myAction",
      isCollection: false,
    };

    const actionMock = new ActionMock(options);
    const params = { value: "testValue" };
    const result = actionMock.invoke(params);

    //Expect a single entity wrapper instance
    expect(result).toBeInstanceOf(EntitySingleImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "testValue" });

    expect(dummyRootOptions.actions.myAction.handler).toHaveBeenCalledWith(undefined, params);
  });

  it("should use createSetWorker when isCollection is true", () => {
    const options: ActionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myAction",
      isCollection: true,
    };

    const actionMock = new ActionMock(options);
    const params = { value: "collectionTest" };
    const result = actionMock.invoke(params);

    //Expect a collection wrapper instance
    expect(result).toBeInstanceOf(EntitySetImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "collectionTest" });

    expect(dummyRootOptions.actions.myAction.handler).toHaveBeenCalledWith(undefined, params);
  });
});

describe("EntityActionMock", () => {
  let dummyRootOptions: MockODataClientOptions;
  beforeEach(() => {
    dummyRootOptions = {
      entitySets: {},
      actions: {
        myEntityAction: {
          handler: jest.fn().mockImplementation((key, params) => {
            return { result: `${key}_${params.value}` };
          }),
        },
      },
      functions: {},
    };
  });

  it("should use createSingleWorker when isCollection is false", () => {
    const options: ActionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myEntityAction",
      isCollection: false,
    };

    const entityActionMock = new EntityActionMock(options);
    const key = "123";
    const params = { value: "entityTest" };
    const result = entityActionMock.invoke(key, params);

    //Expect a single entity wrapper instance
    expect(result).toBeInstanceOf(EntitySingleImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "123_entityTest" });

    expect(dummyRootOptions.actions.myEntityAction.handler).toHaveBeenCalledWith(key, params);
  });

  it("should use createSetWorker when isCollection is true", () => {
    const options: ActionMockOptions = {
      rootOptions: dummyRootOptions,
      name: "myEntityAction",
      isCollection: true,
    };

    const entityActionMock = new EntityActionMock(options);
    const key = "456";
    const params = { value: "collectedValue" };
    const result = entityActionMock.invoke(key, params);

    //Expect a collection wrapper instance
    expect(result).toBeInstanceOf(EntitySetImpl);

    const workerGetData = (result as any).worker.options.getData;
    const data = workerGetData();
    expect(data).toEqual({ result: "456_collectedValue" });

    expect(dummyRootOptions.actions.myEntityAction.handler).toHaveBeenCalledWith(key, params);
  });
});
