import { createOperatorFactory } from "../../../../src";
import { ActionBuilderMock, ActionBuilderMockOptions, EntityActionBuilderMock, EntityActionBuilderMockOptions } from "../../../../src/core/action/builder/action-builder.mock";

const o = createOperatorFactory();

describe("ActionBuilderMock", () => {
  const dummyOptions: ActionBuilderMockOptions = {
    rootOptions: {
      entitySets: {},
      actions: {
        testAction: {
          handler: () => ({ result: true })
        }
      },
      functions: {},
    },
    name: "testAction",
  };

  it("should default to POST method when withDefaultMethod is called", () => {
    const builder = new ActionBuilderMock(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("POST");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new ActionBuilderMock(dummyOptions);
    builder.withMethod("PATCH");
    expect(builder.method).toBe("PATCH");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new ActionBuilderMock(dummyOptions);
    const paramValue = { value: "test value" };
    builder.withParameters<typeof paramValue>();
    expect(builder.isBody).toBe(false);
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new ActionBuilderMock(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new ActionBuilderMock(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new ActionBuilderMock(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new ActionBuilderMock(dummyOptions)
      .withMethod("GET")
      .withBody<{ value: string }>()
      .withCollectionResponse<{ result: boolean }>();

    const action = builder.build();
    expect(action).toBeTruthy();
  });
});

describe("EntityActionBuilderMock", () => {
  const dummyOptions: EntityActionBuilderMockOptions = {
    rootOptions: {
      entitySets: {},
      actions: {
        testAction: {
          handler: () => ({ result: true })
        }
      },
      functions: {},
    },
    name: "testAction",
  };

  it("should default to POST method when withDefaultMethod is called", () => {
    const builder = new EntityActionBuilderMock(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("POST");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new EntityActionBuilderMock(dummyOptions);
    builder.withMethod("DELETE");
    expect(builder.method).toBe("DELETE");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new EntityActionBuilderMock(dummyOptions);
    const paramValue = { id: 123 };
    builder.withParameters<typeof paramValue>();
    expect(builder.isBody).toBe(false);
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new EntityActionBuilderMock(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new EntityActionBuilderMock(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new EntityActionBuilderMock(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new EntityActionBuilderMock(dummyOptions)
      .withMethod("PUT")
      .withBody<{ id: number }>()
      .withSingleResponse<{ success: boolean }>();

    const action = builder.build();
    expect(action).toBeTruthy();
  });
});
