import { createOperatorFactory } from "../../../../src";
import { EntityFunctionBuilderImpl, EntityFunctionBuilderImplOptions, FunctionBuilderImpl, FunctionBuilderImplOptions } from "../../../../src/core/function/builder/function-builder.impl";

const o = createOperatorFactory();

describe("FunctionBuilderImpl", () => {
  const dummyOptions: FunctionBuilderImplOptions = {
    rootOptions: {
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: {},
    },
    name: "testFunction"
  };

  it("should default to GET method when withDefaultMethod is called", () => {
    const builder = new FunctionBuilderImpl(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("GET");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new FunctionBuilderImpl(dummyOptions);
    builder.withMethod("PATCH");
    expect(builder.method).toBe("PATCH");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new FunctionBuilderImpl(dummyOptions);
    const paramValue = { value: "test value" };
    builder.withParameters<typeof paramValue>({ value: o.string });
    expect(builder.isBody).toBe(false);
    expect(builder.values).toBeTruthy();
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new FunctionBuilderImpl(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new FunctionBuilderImpl(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new FunctionBuilderImpl(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new FunctionBuilderImpl(dummyOptions)
      .withMethod("GET")
      .withBody<{ value: string }>()
      .withCollectionResponse<{ result: boolean }>();

    const Function = builder.build();
    expect(Function).toBeTruthy();
  });
});

describe("EntityFunctionBuilderImpl", () => {
  const dummyOptions: EntityFunctionBuilderImplOptions = {
    rootOptions: {
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: {},
    },
    name: "entityFunction",
    entitySet: undefined!,
  };

  it("should default to GET method when withDefaultMethod is called", () => {
    const builder = new EntityFunctionBuilderImpl(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("GET");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new EntityFunctionBuilderImpl(dummyOptions);
    builder.withMethod("DELETE");
    expect(builder.method).toBe("DELETE");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new EntityFunctionBuilderImpl(dummyOptions);
    const paramValue = { id: 123 };
    builder.withParameters<typeof paramValue>({ id: o.int });
    expect(builder.isBody).toBe(false);
    expect(builder.values).toBeTruthy();
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new EntityFunctionBuilderImpl(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new EntityFunctionBuilderImpl(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new EntityFunctionBuilderImpl(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new EntityFunctionBuilderImpl(dummyOptions)
      .withMethod("PUT")
      .withBody<{ id: number }>()
      .withSingleResponse<{ success: boolean }>();

    const Function = builder.build();
    expect(Function).toBeTruthy();
  });
});
