import { createOperatorFactory, HttpResponseData, ODataPathRoutingType } from "../../../../src";
import { EntitySetClientImpl, EntitySetClientImplOptions, extendEntityUrl } from "../../../../src/core/entity/client/entity-set-client.impl";
import { EntitySetImpl } from "../../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../../src/core/entity/single/entity-single";
import { SafeAny } from "../../../../src/utils/types";
import { Value } from "../../../../src/values/base";

const o = createOperatorFactory();

describe("EntitySetClientImpl", () => {
  let options: EntitySetClientImplOptions;
  let client: EntitySetClientImpl<SafeAny, SafeAny>;

  beforeEach(() => {
    options = {
      rootOptions: {
        serviceUrl: "http://example.com",
        routingType: "parentheses",
        http: { adapter: { invoke: jest.fn() } },
      },
      entitySet: "users",
      key: "id",
      keyType: o.int as (value: unknown) => Value<unknown>,
      validator: (value: unknown) => value,
      readSet: "GET",
      read: "GET",
      create: "POST",
      update: "PUT",
      delete: "DELETE",
    };
    client = new EntitySetClientImpl(options);
  });

  describe("Getter: set", () => {
    it("should return an instance of EntitySetImpl when readSet is provided", () => {
      const setInstance = client.set;
      expect(setInstance).toBeInstanceOf(EntitySetImpl);
      expect((setInstance as SafeAny)["worker"]).toMatchObject({
        options: {
          method: options.readSet,
          url: `${options.rootOptions.serviceUrl}/${options.entitySet}`,
        },
      });
    });

    it("should throw error when readSet is not provided", () => {
      delete options.readSet;
      client = new EntitySetClientImpl(options);
      expect(() => client.set).toThrow(
        "This resource does not support querying the entity set"
      );
    });
  });

  describe("Method: read", () => {
    it("should return an instance of EntitySingleImpl when read is provided", () => {
      const key = 123;
      const singleInstance = client.read(key);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      const expectedUrl = extendEntityUrl(
        `${options.rootOptions.serviceUrl}/${options.entitySet}`,
        options.rootOptions.routingType,
        options.key,
        key,
        options.keyType
      );
      expect((singleInstance as SafeAny)["worker"]).toMatchObject({
        options: {
          method: options.read,
          url: expectedUrl,
        },
      });
    });

    it("should throw error when read option is not provided", () => {
      delete options.read;
      client = new EntitySetClientImpl(options);
      expect(() => client.read(123)).toThrow(
        "This resource does not support reading entities"
      );
    });
  });

  describe("Method: create", () => {
    it("should return an instance of EntitySingleImpl when create is provided", () => {
      const entity = { name: "John" };
      const singleInstance = client.create(entity);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      expect((singleInstance as SafeAny)["worker"]).toMatchObject({
        options: {
          method: options.create,
          url: `${options.rootOptions.serviceUrl}/${options.entitySet}`,
          payload: entity,
        },
      });
    });

    it("should throw error when create option is not provided", () => {
      delete options.create;
      client = new EntitySetClientImpl(options);
      expect(() => client.create({ name: "John" })).toThrow(
        "This resource does not support creating entities"
      );
    });
  });

  describe("Method: update", () => {
    it("should return an instance of EntitySingleImpl when update is provided", () => {
      const key = 456;
      const entity = { name: "Jane" };
      const singleInstance = client.update(key, entity);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      const expectedUrl = extendEntityUrl(
        `${options.rootOptions.serviceUrl}/${options.entitySet}`,
        options.rootOptions.routingType,
        options.key,
        key,
        options.keyType
      );
      expect((singleInstance as SafeAny)["worker"]).toMatchObject({
        options: {
          method: options.update,
          url: expectedUrl,
          payload: entity,
        },
      });
    });

    it("should throw error when update option is not provided", () => {
      delete options.update;
      client = new EntitySetClientImpl(options);
      expect(() => client.update(789, { name: "Jane" })).toThrow(
        "This resource does not support updating entities"
      );
    });
  });

  describe("Method: delete", () => {
    it("should throw error when delete option is not provided", async () => {
      delete options.delete;
      client = new EntitySetClientImpl(options);
      expect(() => client.delete(123)).toThrow(
        "This resource does not support deleting entities"
      );
    });

    it("should resolve without error when delete option is provided", async () => {
      options.rootOptions.http.adapter = {
        invoke() {
          const data: HttpResponseData = {
            data: Promise.resolve(""),
            status: 204,
          };
          return Promise.resolve(data);
        }
      };
      const actionInstance = client.delete(123);
      expect(actionInstance).toHaveProperty("execute");
      const result = await actionInstance.execute().result;
      expect(result).toBeTruthy();
    });
  });

  describe("extendEntityUrl", () => {
    it("non-array key with slash routing", () => {
      const baseUrl = "http://example.com/users";
      const routingType: ODataPathRoutingType = "slash";
      const keyName = "id";
      const key = 123;
      const keyType = o.int as (value: unknown) => Value<unknown>;
      const result = extendEntityUrl(baseUrl, routingType, keyName, key, keyType);
      expect(result).toEqual(`${baseUrl}/${key}`);
    });

    it("non-array key with parentheses routing", () => {
      const baseUrl = "http://example.com/users";
      const routingType: ODataPathRoutingType = "parentheses";
      const keyName = "id";
      const key = 123;
      const keyType = o.int as (value: unknown) => Value<unknown>;
      const result = extendEntityUrl(baseUrl, routingType, keyName, key, keyType);
      expect(result).toEqual(`${baseUrl}(${key})`);
    });

    it("array key with slash routing", () => {
      const baseUrl = "http://example.com/users";
      const routingType: ODataPathRoutingType = "slash";
      const keyName = ["id", "name"];
      const key = [123, "john"];
      const keyType = [o.int as (value: unknown) => Value<unknown>, o.string as (value: unknown) => Value<unknown>];
      const result = extendEntityUrl(baseUrl, routingType, keyName, key, keyType);
      expect(result).toEqual(`${baseUrl}/Id=123,Name='john'`);
    });

    it("array key with parentheses routing", () => {
      const baseUrl = "http://example.com/users";
      const routingType: ODataPathRoutingType = "parentheses";
      const keyName = ["id", "name"];
      const key = [123, "john"];
      const keyType = [o.int as (value: unknown) => Value<unknown>, o.string as (value: unknown) => Value<unknown>];
      const result = extendEntityUrl(baseUrl, routingType, keyName, key, keyType);
      expect(result).toEqual(`${baseUrl}(Id=123,Name='john')`);
    });

    it("throws error when key and keyType types mismatch", () => {
      const baseUrl = "http://example.com/users";
      const routingType: ODataPathRoutingType = "slash";
      const keyName = ["id"];
      const key = 123;
      const keyType = o.int as (value: unknown) => Value<unknown>;
      expect(() =>
        extendEntityUrl(baseUrl, routingType, keyName, key, keyType)
      ).toThrow("The ids and value builders must both be arrays or non-arrays");
    });
  });
});
