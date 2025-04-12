import { ODataClient } from "../../../src";
import { ActionBuilderImpl, EntityActionBuilderImpl } from "../../../src/core/action/builder/action-builder.impl";
import { EntitySetBuilderImpl } from "../../../src/core/entity/client/builder/entity-set-client-builder.impl";
import { SafeAny } from "../../../src/utils/types";

interface Model {
  id: number;
  name: string;
}

describe('ODataClient', () => {
  let client: ODataClient;

  beforeEach(() => {
    client = new ODataClient({
      http: { headers: {} },
      serviceUrl: "https://localhost:9000",
      routingType: "parentheses",
    });
  });

  it('should return an entity set builder', () => {
    const builder = client.entitySet<Model>("models");
    expect(builder).toBeInstanceOf(EntitySetBuilderImpl);
  });

  it('should return an action builder', () => {
    const builder = client.action("myAction");
    expect(builder).toBeInstanceOf(ActionBuilderImpl);
  });

  it('should return an entity action builder', () => {
    const builder = client.action({} as SafeAny, "myEntityAction");
    expect(builder).toBeInstanceOf(EntityActionBuilderImpl);
  });
});
