import { createOperatorFactory } from "../../../../src";
import { ActionBuilderImpl, ActionBuilderImplOptions, EntityActionBuilderImpl, EntityActionBuilderImplOptions } from "../../../../src/core/action/builder/action-builder.impl";

const o = createOperatorFactory();

describe("ActionBuilderImpl", () => {
  const dummyOptions: ActionBuilderImplOptions = {
    rootOptions: {
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: {},
    },
    name: "testAction"
  };

  it("should default to POST method when withDefaultMethod is called", () => {
    const builder = new ActionBuilderImpl(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("POST");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new ActionBuilderImpl(dummyOptions);
    builder.withMethod("PATCH");
    expect(builder.method).toBe("PATCH");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new ActionBuilderImpl(dummyOptions);
    const paramValue = { value: "test value" };
    builder.withParameters<typeof paramValue>({ value: o.string });
    expect(builder.isBody).toBe(false);
    expect(builder.values).toBeTruthy();
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new ActionBuilderImpl(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new ActionBuilderImpl(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new ActionBuilderImpl(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new ActionBuilderImpl(dummyOptions)
      .withMethod("GET")
      .withBody<{ value: string }>()
      .withCollectionResponse<{ result: boolean }>();

    const action = builder.build();
    expect(action).toBeTruthy();
  });
});

describe("EntityActionBuilderImpl", () => {
  const dummyOptions: EntityActionBuilderImplOptions = {
    rootOptions: {
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: {},
    },
    name: "entityAction",
    entitySet: undefined!,
  };

  it("should default to POST method when withDefaultMethod is called", () => {
    const builder = new EntityActionBuilderImpl(dummyOptions);
    builder.withDefaultMethod();
    expect(builder.method).toBe("POST");
  });

  it("should override the method when withMethod is used", () => {
    const builder = new EntityActionBuilderImpl(dummyOptions);
    builder.withMethod("DELETE");
    expect(builder.method).toBe("DELETE");
  });

  it("should set isBody to false and store parameter values when withParameters is used", () => {
    const builder = new EntityActionBuilderImpl(dummyOptions);
    const paramValue = { id: 123 };
    builder.withParameters<typeof paramValue>({ id: o.int });
    expect(builder.isBody).toBe(false);
    expect(builder.values).toBeTruthy();
  });

  it("should set isBody to true when withBody is used", () => {
    const builder = new EntityActionBuilderImpl(dummyOptions);
    builder.withBody();
    expect(builder.isBody).toBe(true);
  });

  it("should correctly set isCollection based on withCollectionResponse and withSingleResponse", () => {
    const builderCollection = new EntityActionBuilderImpl(dummyOptions);
    builderCollection.withCollectionResponse();
    expect(builderCollection.isCollection).toBe(true);

    const builderSingle = new EntityActionBuilderImpl(dummyOptions);
    builderSingle.withSingleResponse();
    expect(builderSingle.isCollection).toBe(false);
  });

  it("should chain methods appropriately", () => {
    const builder = new EntityActionBuilderImpl(dummyOptions)
      .withMethod("PUT")
      .withBody<{ id: number }>()
      .withSingleResponse<{ success: boolean }>();

    const action = builder.build();
    expect(action).toBeTruthy();
  });
});
