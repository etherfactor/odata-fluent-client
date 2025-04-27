import { createOperatorFactory, MockODataClient } from "../../../src";
import { ActionBuilderMock, EntityActionBuilderMock } from "../../../src/core/action/builder/action-builder.mock";
import { EntitySetBuilderMock } from "../../../src/core/entity/client/builder/entity-set-client-builder.mock";
import { EntityNavigationBuilderMock } from "../../../src/core/entity/navigation/builder/entity-navigation-builder.mock";
import { EntityFunctionBuilderMock, FunctionBuilderMock } from "../../../src/core/function/builder/function-builder.mock";
import { SafeAny } from "../../../src/utils/types";

interface Model {
  id: number;
  name: string;
}

const o = createOperatorFactory();

describe("MockODataClient", () => {
  let client: MockODataClient;

  beforeEach(() => {
    client = new MockODataClient({
      entitySets: {},
      actions: {},
      functions: {},
    });
  });

  it("should return an entity set builder", () => {
    const builder = client.entitySet<Model>("models");
    expect(builder).toBeInstanceOf(EntitySetBuilderMock);
  });

  it("should return a navigation builder", () => {
    const set = client.entitySet<Model>("models").withKey("id").withKeyType(o.int).build();
    const builder = client.navigation(set, "name");
    expect(builder).toBeInstanceOf(EntityNavigationBuilderMock);
  });

  it("should return an action builder", () => {
    const builder = client.action("myAction");
    expect(builder).toBeInstanceOf(ActionBuilderMock);
  });

  it("should return an entity action builder", () => {
    const builder = client.action({} as SafeAny, "myEntityAction");
    expect(builder).toBeInstanceOf(EntityActionBuilderMock);
  });

  it("should return a function builder", () => {
    const builder = client.function("myFunction");
    expect(builder).toBeInstanceOf(FunctionBuilderMock);
  });
  
  it("should return an entity function builder", () => {
    const builder = client.function({} as SafeAny, "myEntityFunction");
    expect(builder).toBeInstanceOf(EntityFunctionBuilderMock);
  });

  it("should bind navigations", () => {
    const set = client.entitySet<Model>("models").withKey("id").withKeyType(o.int).build();
    const nav = client.navigation(set, "name").withSingle().withReference(set).build();
    expect(set).not.toHaveProperty("navigations");

    const newSet = client.bind.navigation(set, { name: nav });
    expect(newSet).toHaveProperty("navigations");
    expect(newSet.navigations).toHaveProperty("name");

    const newNewSet = client.bind.navigation(newSet, { other: nav });
    expect(newNewSet.navigations).toHaveProperty("other");
  });

  it("should bind actions", () => {
    const set = client.entitySet<Model>("models").withKey("id").withKeyType(o.int).build();
    const act = client.action(set, "myAction").withDefaultMethod().withBody<{ param: string }>().withSingleResponse().build();
    expect(set).not.toHaveProperty("actions");

    const newSet = client.bind.action(set, { myAction: act });
    expect(newSet).toHaveProperty("actions");
    expect(newSet.actions).toHaveProperty("myAction");

    const newNewSet = client.bind.action(newSet, { other: act });
    expect(newNewSet.actions).toHaveProperty("other");
  });

  it("should bind functions", () => {
    const set = client.entitySet<Model>("models").withKey("id").withKeyType(o.int).build();
    const func = client.function(set, "myFunction").withDefaultMethod().withBody<{ param: string }>().withSingleResponse().build();
    expect(set).not.toHaveProperty("functions");

    const newSet = client.bind.function(set, { myFunction: func });
    expect(newSet).toHaveProperty("functions");
    expect(newSet.functions).toHaveProperty("myFunction");

    const newNewSet = client.bind.function(newSet, { other: func });
    expect(newNewSet.functions).toHaveProperty("other");
  });
});
