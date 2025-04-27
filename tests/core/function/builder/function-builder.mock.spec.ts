import { createOperatorFactory } from "../../../../src";
import { EntityFunctionBuilderMock, EntityFunctionBuilderMockOptions, FunctionBuilderMock, FunctionBuilderMockOptions } from "../../../../src/core/function/builder/function-builder.mock";

const o = createOperatorFactory();

describe("FunctionBuilderMock", () => {
  const dummyOptions: FunctionBuilderMockOptions = {
    rootOptions: {
      entitySets: {},
      actions: {},
      functions: {
        testFunction: {
          handler: () => ({ result: true })
        }
      },
    },
    name: "testFunction",
  };

  it("should default to GET method when withDefaultMethod is called", () => {
    const builder = new FunctionBuilderMock(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("GET");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new FunctionBuilderMock(dummyOptions);
    builder.withMethod("PATCH");
    expect(builder.method).toBe("PATCH");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new FunctionBuilderMock(dummyOptions);
    const paramValue = { value: "test value" };
    builder.withParameters<typeof paramValue>();
    expect(builder.isBody).toBe(false);
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new FunctionBuilderMock(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new FunctionBuilderMock(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new FunctionBuilderMock(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new FunctionBuilderMock(dummyOptions)
      .withMethod("GET")
      .withBody<{ value: string }>()
      .withCollectionResponse<{ result: boolean }>();

    const Function = builder.build();
    expect(Function).toBeTruthy();
  });
});

describe("EntityFunctionBuilderMock", () => {
  const dummyOptions: EntityFunctionBuilderMockOptions = {
    rootOptions: {
      entitySets: {},
      actions: {},
      functions: {
        testFunction: {
          handler: () => ({ result: true })
        }
      },
    },
    name: "testFunction",
  };

  it("should default to GET method when withDefaultMethod is called", () => {
    const builder = new EntityFunctionBuilderMock(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("GET");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new EntityFunctionBuilderMock(dummyOptions);
    builder.withMethod("DELETE");
    expect(builder.method).toBe("DELETE");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new EntityFunctionBuilderMock(dummyOptions);
    const paramValue = { id: 123 };
    builder.withParameters<typeof paramValue>();
    expect(builder.isBody).toBe(false);
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new EntityFunctionBuilderMock(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new EntityFunctionBuilderMock(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new EntityFunctionBuilderMock(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new EntityFunctionBuilderMock(dummyOptions)
      .withMethod("PUT")
      .withBody<{ id: number }>()
      .withSingleResponse<{ success: boolean }>();

    const Function = builder.build();
    expect(Function).toBeTruthy();
  });
});
