import { createOperatorFactory, MockODataClient } from "../../../../src";
import { NewMockODataClientOptions } from "../../../../src/core/client/odata-client.mock";
import { EntityNavigationBuilderMock, EntityNavigationBuilderMockOptions } from "../../../../src/core/entity/navigation/builder/entity-navigation-builder.mock";
import { EntityNavigationClientMock } from "../../../../src/core/entity/navigation/entity-navigation.mock";
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

describe("EntityNavigationBuilderMock", () => {
  const dummyRootOptions: NewMockODataClientOptions = {
    actions: {},
    entitySets: {},
    functions: {},
  };
  
  const rootClient = new MockODataClient(dummyRootOptions);
  
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

  let builderOptions: EntityNavigationBuilderMockOptions;
  
  describe("for collection navigation", () => {
    beforeEach(() => {
      builderOptions = {
        rootOptions: dummyRootOptions,
        entitySet: fromSet,
        navigation: "navProperty",
      };
    });

    it("should correctly configure the navigation with add and remove methods", () => {
      const builder = new EntityNavigationBuilderMock<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        true
      >(builderOptions);

      const finalBuilder = builder.withCollection()
        .withReference(toSet)
        .withAdd("POST")
        .withRemove("DELETE");

      const navigation = finalBuilder.build();

      expect(navigation).toBeInstanceOf(EntityNavigationClientMock);

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

    it("should allow building without add/remove configuration", () => {
      const builder = new EntityNavigationBuilderMock<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        true
      >(builderOptions);

      const navigation = builder
        .withCollection()
        .withReference(toSet)
        .build();

      const options = (navigation as SafeAny).options;
      expect(options.add).toBeUndefined();
      expect(options.remove).toBeUndefined();
    });
  });

  describe("for single navigation", () => {
    it("should correctly configure the navigation with set and unset methods", () => {
      // Create a new builder instance for single navigation.
      const builder = new EntityNavigationBuilderMock<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        false
      >(builderOptions);

      const finalBuilder = builder.withSingle()
        .withReference(toSet)
        .withSet("PUT")
        .withUnset("PATCH");

      const navigation = finalBuilder.build();

      expect(navigation).toBeInstanceOf(EntityNavigationClientMock);

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

    it("should allow building without set/unset configuration", () => {
      const builder = new EntityNavigationBuilderMock<
        DummyEntity,
        "id",
        "nav",
        DummyNavEntity,
        "id",
        false
      >(builderOptions);

      const navigation = builder
        .withSingle()
        .withReference(toSet)
        .build();

      const options = (navigation as SafeAny).options;
      expect(options.set).toBeUndefined();
      expect(options.unset).toBeUndefined();
    });
  });
});
