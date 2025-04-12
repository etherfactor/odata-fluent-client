import { createOperatorFactory, EntitySetClient, HttpClientAdapter, HttpResponseData, ODataClient, ODataClientOptions } from "../../../src";
import { EntityNavigationClientImpl, EntityNavigationClientImplOptions } from "../../../src/core/entity/navigation/entity-navigation.impl";
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

describe("EntitySetClientImpl", () => {
  let adapter: HttpClientAdapter;
  let options: EntityNavigationClientImplOptions;
  let client: EntityNavigationClientImpl<SafeAny, SafeAny>;

  let fromSet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  let toSet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;

  beforeEach(() => {
    adapter = { invoke: jest.fn().mockResolvedValue(<HttpResponseData>{ status: 204, data: Promise.resolve({}) }) };
    const rootOptions: ODataClientOptions = {
      serviceUrl: "http://example.com",
      routingType: "parentheses",
      http: { adapter: adapter },
    };
    const rootClient = new ODataClient(rootOptions);

    fromSet = rootClient
      .entitySet<Entity>("entities")
      .withKey("id")
      .withKeyType(o.int)
      .build();

    toSet = rootClient
      .entitySet<NavEntity>("navEntities")
      .withKey("id")
      .withKeyType(o.string)
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
    client = new EntityNavigationClientImpl(options);
  });

  describe("Method: add", () => {
    it("should return an executable when add is provided", () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.add(key1, key2);
      expect(typeof singleInstance).toBe("object");

      singleInstance.execute();

      const expectedUrl = `${options.rootOptions.serviceUrl}/entities(123)/models/$ref`;
      expect(adapter.invoke).toHaveBeenCalledWith({
        method: "POST",
        url: expectedUrl,
        headers: {},
        query: {},
        body: { "@odata.id": `${options.rootOptions.serviceUrl}/navEntities('123')` },
      });
    });

    it("should throw error when add option is not provided", () => {
      delete options.add;
      client = new EntityNavigationClientImpl(options);
      expect(() => client.add(123, "123")).toThrow(
        "This resource does not support adding navigations"
      );
    });
  });

  describe("Method: remove", () => {
    it("should return an executable when remove is provided", () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.remove(key1, key2);
      expect(typeof singleInstance).toBe("object");

      singleInstance.execute();

      const expectedUrl = `${options.rootOptions.serviceUrl}/entities(123)/models/$ref`;
      expect(adapter.invoke).toHaveBeenCalledWith({
        method: "DELETE",
        url: expectedUrl,
        headers: {},
        query: { "$id": `${options.rootOptions.serviceUrl}/navEntities('123')` },
        body: {},
      });
    });

    it("should throw error when remove option is not provided", () => {
      delete options.remove;
      client = new EntityNavigationClientImpl(options);
      expect(() => client.remove(123, "123")).toThrow(
        "This resource does not support removing navigations"
      );
    });
  });

  describe("Method: set", () => {
    it("should return an executable when set is provided", () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.set(key1, key2);
      expect(typeof singleInstance).toBe("object");

      singleInstance.execute();

      const expectedUrl = `${options.rootOptions.serviceUrl}/entities(123)/models/$ref`;
      expect(adapter.invoke).toHaveBeenCalledWith({
        method: "PUT",
        url: expectedUrl,
        headers: {},
        query: {},
        body: { "@odata.id": `${options.rootOptions.serviceUrl}/navEntities('123')` },
      });
    });

    it("should throw error when set option is not provided", () => {
      delete options.set;
      client = new EntityNavigationClientImpl(options);
      expect(() => client.set(123, "123")).toThrow(
        "This resource does not support setting navigations"
      );
    });
  });

  describe("Method: unset", () => {
    it("should return an executable when unset is provided", () => {
      const key1 = 123;
      const key2 = "123";
      const singleInstance = client.unset(key1, key2);
      expect(typeof singleInstance).toBe("object");

      singleInstance.execute();

      const expectedUrl = `${options.rootOptions.serviceUrl}/entities(123)/models/$ref`;
      expect(adapter.invoke).toHaveBeenCalledWith({
        method: "DELETE",
        url: expectedUrl,
        headers: {},
        query: {},
        body: {},
      });
    });

    it("should throw error when unset option is not provided", () => {
      delete options.unset;
      client = new EntityNavigationClientImpl(options);
      expect(() => client.unset(123, "123")).toThrow(
        "This resource does not support unsetting navigations"
      );
    });
  });
});
