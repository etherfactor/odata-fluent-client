import { createOperatorFactory, EntitySetClient } from "../../../src";
import { MockODataClient, MockODataClientOptions } from "../../../src/core/client/odata-client.mock";
import { EntityNavigationClientMock, EntityNavigationClientMockOptions } from "../../../src/core/entity/navigation/entity-navigation.mock";
import { SafeAny } from "../../../src/utils/types";

interface Entity {
  id: number;
  name: string;
  nav?: any;
}

interface NavEntity {
  id: string;
  description: string;
}

const o = createOperatorFactory();

describe("EntitySetClientMock", () => {
  let rootOptions: MockODataClientOptions;
  let options: EntityNavigationClientMockOptions;
  let client: EntityNavigationClientMock<SafeAny, SafeAny>;

  let fromSet: EntitySetClient<SafeAny, SafeAny, "GET", "GET", SafeAny, SafeAny, SafeAny>;
  let toSet: EntitySetClient<SafeAny, SafeAny, "GET", "GET", SafeAny, SafeAny, SafeAny>;

  let onAdd = jest.fn();
  let onRemove = jest.fn();
  let onSet = jest.fn();
  let onUnset = jest.fn();
  beforeEach(() => {
    let id = 1000;
    rootOptions = {
      actions: {},
      entitySets: {
        entities: {
          data: () => ({
            "123": <Entity>{ id: 123, name: "Name" },
          }),
          id: "id",
          idGenerator: () => ++id,
          navigations: {
            models: {
              targetEntitySet: "navEntities",
              type: undefined!,
              onAdd: (onAdd = jest.fn()),
              onRemove: (onRemove = jest.fn()),
              onSet: (onSet = jest.fn()),
              onUnset: (onUnset = jest.fn()),
            },
          },
        },
        navEntities: {
          data: () => ({
            "123": <NavEntity>{ id: "123", description: "Description" },
          }),
          id: "id",
          idGenerator: () => (++id).toString(),
        }
      },
      functions: {},
    };
    const rootClient = new MockODataClient(rootOptions);

    fromSet = rootClient
      .entitySet<Entity>("entities")
      .withKey("id")
      .withKeyType(o.int)
      .withReadSet("GET")
      .withRead("GET")
      .build();

    toSet = rootClient
      .entitySet<NavEntity>("navEntities")
      .withKey("id")
      .withKeyType(o.string)
      .withReadSet("GET")
      .withRead("GET")
      .build();

    options = {
      rootOptions: rootOptions,
      fromSet: fromSet,
      navigation: "models",
      toSet: toSet,
      add: "POST",
      remove: "DELETE",
      set: "PUT",
      unset: "DELETE",
    };
    client = new EntityNavigationClientMock(options);
  });

  describe("Method: add", () => {
    it("should return an executable when add is provided", async () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.add(key1, key2);
      expect(typeof singleInstance).toBe("object");

      const result = await singleInstance.execute().result;
      expect(result).toBeTruthy();
      expect(onAdd).toHaveBeenCalled();
    });

    it("should return false when from entity set does not exist", async () => {
      options.fromSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.add(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should return false when to entity set does not exist", async () => {
      options.toSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.add(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should throw error when add option is not provided", () => {
      delete options.add;
      client = new EntityNavigationClientMock(options);
      expect(() => client.add(123, "123")).toThrow(
        "This resource does not support adding navigations"
      );
    });
  });

  describe("Method: remove", () => {
    it("should return an executable when remove is provided", async () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.remove(key1, key2);
      expect(typeof singleInstance).toBe("object");

      const result = await singleInstance.execute().result;
      expect(result).toBeTruthy();
      expect(onRemove).toHaveBeenCalled();
    });

    it("should return false when from entity set does not exist", async () => {
      options.fromSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.remove(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should return false when to entity set does not exist", async () => {
      options.toSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.remove(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should throw error when remove option is not provided", () => {
      delete options.remove;
      client = new EntityNavigationClientMock(options);
      expect(() => client.remove(123, "123")).toThrow(
        "This resource does not support removing navigations"
      );
    });
  });

  describe("Method: set", () => {
    it("should return an executable when set is provided", async () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.set(key1, key2);
      expect(typeof singleInstance).toBe("object");

      const result = await singleInstance.execute().result;
      expect(result).toBeTruthy();
      expect(onSet).toHaveBeenCalled();
    });

    it("should return false when from entity set does not exist", async () => {
      options.fromSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.set(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should return false when to entity set does not exist", async () => {
      options.toSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.set(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should throw error when set option is not provided", () => {
      delete options.set;
      client = new EntityNavigationClientMock(options);
      expect(() => client.set(123, "123")).toThrow(
        "This resource does not support setting navigations"
      );
    });
  });

  describe("Method: unset", () => {
    it("should return an executable when unset is provided", async () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.unset(key1, key2);
      expect(typeof singleInstance).toBe("object");

      const result = await singleInstance.execute().result;
      expect(result).toBeTruthy();
      expect(onUnset).toHaveBeenCalled();
    });

    it("should return false when from entity set does not exist", async () => {
      options.fromSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.unset(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should return false when to entity set does not exist", async () => {
      options.toSet = new MockODataClient(rootOptions)
        .entitySet<Entity>("invalid")
        .withKey("id")
        .withKeyType(o.int)
        .withReadSet("GET")
        .withRead("GET")
        .build();

      client = new EntityNavigationClientMock(options);
      const result = await client.unset(123, 123).execute().result;
      expect(result).toBeFalsy();
    });

    it("should throw error when unset option is not provided", () => {
      delete options.unset;
      client = new EntityNavigationClientMock(options);
      expect(() => client.unset(123, "123")).toThrow(
        "This resource does not support unsetting navigations"
      );
    });
  });
});
