import { createOperatorFactory, ODataClient, ODataClientOptions } from "../../../../src";
import { EntityNavigationBuilderImpl, EntityNavigationBuilderImplOptions } from "../../../../src/core/entity/navigation/builder/entity-navigation-builder.impl";
import { EntityNavigationClientImpl } from "../../../../src/core/entity/navigation/entity-navigation.impl";
import { SafeAny } from "../../../../src/utils/types";

interface DummyEntity {
  id: number;
  name: string;
  nav?: any;
}

interface DummyNavEntity {
  id: string;
  description: string;
}

const o = createOperatorFactory();

describe("EntityNavigationBuilderImpl", () => {
  const dummyRootOptions: ODataClientOptions = {
    serviceUrl: "http://localhost",
    routingType: "parentheses",
    http: {},
  };

  const rootClient = new ODataClient(dummyRootOptions);
  
  const fromSet = rootClient
    .entitySet<DummyEntity>("dummyEntities")
    .withKey("id")
    .withKeyType(o.int)
    .build();

  const toSet = rootClient
    .entitySet<DummyNavEntity>("dummyNavEntities")
    .withKey("id")
    .withKeyType(o.string)
    .build();

  let builderOptions: EntityNavigationBuilderImplOptions;

  beforeEach(() => {
    builderOptions = {
      rootOptions: dummyRootOptions,
      entitySet: fromSet,
      navigation: "navProperty",
    };
  });

  describe("chaining for collection navigation", () => {
    it("should assign the reference and add/remove methods then build a navigation", () => {
      const builder = new EntityNavigationBuilderImpl<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        true
      >(builderOptions);

      const finalBuilder = builder
        .withCollection()
        .withReference(toSet)
        .withAdd("POST")
        .withRemove("DELETE");

      const navigation = finalBuilder.build();

      expect(navigation).toBeInstanceOf(EntityNavigationClientImpl);
      
      const options = (navigation as SafeAny).options;
      expect(options.rootOptions).toEqual(dummyRootOptions);
      expect(options.navigation).toBe("navProperty");
      expect(options.fromSet).toBe(fromSet);
      expect(options.toSet).toBe(toSet);
      expect(options.add).toBe("POST");
      expect(options.remove).toBe("DELETE");
      expect(options.set).toBeUndefined();
      expect(options.unset).toBeUndefined();
    });

    it("should allow chaining without add/remove and then build", () => {
      const builder = new EntityNavigationBuilderImpl<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        true
      >(builderOptions);

      const finalBuilder = builder
        .withCollection()
        .withReference(toSet);

      const navigation = finalBuilder.build();
      const options = (navigation as SafeAny).options;
      expect(options.add).toBeUndefined();
      expect(options.remove).toBeUndefined();
    });
  });

  describe("chaining for single navigation", () => {
    it("should assign the reference and set/unset methods then build a navigation", () => {
      const builder = new EntityNavigationBuilderImpl<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        false
      >(builderOptions);

      const finalBuilder = builder
        .withSingle()
        .withReference(toSet)
        .withSet("PUT")
        .withUnset("PATCH");

      const navigation = finalBuilder.build();

      expect(navigation).toBeInstanceOf(EntityNavigationClientImpl);

      const options = (navigation as SafeAny).options;
      expect(options.rootOptions).toEqual(dummyRootOptions);
      expect(options.navigation).toBe("navProperty");
      expect(options.fromSet).toBe(fromSet);
      expect(options.toSet).toBe(toSet);
      expect(options.set).toBe("PUT");
      expect(options.unset).toBe("PATCH");
      expect(options.add).toBeUndefined();
      expect(options.remove).toBeUndefined();
    });

    it("should allow chaining without set/unset and then build", () => {
      const builder = new EntityNavigationBuilderImpl<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        false
      >(builderOptions);

      const finalBuilder = builder
        .withSingle()
        .withReference(toSet);

      const navigation = finalBuilder.build();
      const options = (navigation as SafeAny).options;
      expect(options.set).toBeUndefined();
      expect(options.unset).toBeUndefined();
    });
  });
});
