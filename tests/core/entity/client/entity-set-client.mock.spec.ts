import { EntitySetClientMock, EntitySetClientMockOptions } from "../../../../src/core/entity/client/entity-set-client.mock";
import { EntitySetImpl } from "../../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../../src/core/entity/single/entity-single";
import { SafeAny } from "../../../../src/utils/types";

interface TestEntity {
  id: number;
  name: string;
}

describe("EntitySetClientMock", () => {
  let entitySet: Record<string, TestEntity>;
  let options: EntitySetClientMockOptions;
  let client: EntitySetClientMock<SafeAny, SafeAny>;

  beforeEach(() => {
    entitySet = {
      "1": { id: 1, name: "Alice" },
    };

    let id = 1;
    options = {
      rootOptions: {
        entitySets: {
          models: {
            data: () => entitySet,
            id: "id",
            idGenerator: () => ++id,
          }
        },
        actions: {},
        functions: {},
      },
      entitySet: "models",
      validator: (value: unknown) => value,
      readSet: "GET",
      read: "GET",
      create: "POST",
      update: "PUT",
      delete: "DELETE",
      addIdToEntity: (entity: TestEntity) => {
        return entity.id ? entity.id.toString() : "newId";
      },
    };

    client = new EntitySetClientMock(options);
  });

  describe("Getter: set", () => {
    it("should return an instance of EntitySetImpl when readSet is provided", () => {
      const setInstance = client.set;
      expect(setInstance).toBeInstanceOf(EntitySetImpl);
      expect((setInstance as SafeAny)["worker"]).toHaveProperty("options");
    });

    it("should throw error when readSet is not provided", () => {
      delete options.readSet;
      client = new EntitySetClientMock(options);
      expect(() => client.set).toThrow(
        "This resource does not support querying the entity set"
      );
    });
  });

  describe("Method: read", () => {
    it("should return an instance of EntitySingleImpl when read is provided", () => {
      const key = 1;
      const singleInstance = client.read(key);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      expect((singleInstance as SafeAny)["worker"].options.getData()).toEqual(entitySet["1"]);
    });

    it("should throw error when read option is not provided", () => {
      delete options.read;
      client = new EntitySetClientMock(options);
      expect(() => client.read(1)).toThrow(
        "This resource does not support reading entities"
      );
    });
  });

  describe("Method: create", () => {
    it("should add a new entity and returns an instance of EntitySingleImpl", () => {
      const newEntity = { id: 2, name: "Bob" };
      const singleInstance = client.create(newEntity);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      expect(entitySet["2"]).toEqual(newEntity);
      expect((singleInstance as SafeAny)["worker"].options.getData()).toEqual(entitySet["2"]);
    });

    it("should throw error when create option is not provided", () => {
      delete options.create;
      client = new EntitySetClientMock(options);
      expect(() => client.create({ id: 2, name: "Bob" })).toThrow(
        "This resource does not support creating entities"
      );
    });
  });

  describe("Method: update", () => {
    it("should merge the update into the existing entity and returns an instance of EntitySingleImpl", () => {
      const updatedData = { name: "Alice Updated", extra: "data" };
      const singleInstance = client.update(1, updatedData);
      expect(singleInstance).toBeInstanceOf(EntitySingleImpl);
      const updatedEntity = entitySet["1"];
      expect(updatedEntity).toMatchObject({
        id: 1,
        name: "Alice Updated",
        extra: "data",
      });
      expect((singleInstance as SafeAny)["worker"].options.getData()).toEqual(entitySet["1"]);
    });

    it("should throw error when update option is not provided", () => {
      delete options.update;
      client = new EntitySetClientMock(options);
      expect(() => client.update(1, { name: "Updated Alice" })).toThrow(
        "This resource does not support updating entities"
      );
    });
  });

  describe("Method: delete", () => {
    it("should resolve without error when delete option is provided", async () => {
      let newEntity = { id: 0, name: "Test" };
      newEntity = await client.create(newEntity).execute().data;

      const actionInstance = client.delete(newEntity.id);
      expect(actionInstance).toHaveProperty("execute");

      await actionInstance.execute().result;
      const deletedEntity = entitySet[newEntity.id];
      expect(deletedEntity).toBeFalsy();
    });

    it("should throw error when delete option is not provided", async () => {
      delete options.delete;
      client = new EntitySetClientMock(options);
      expect(() => client.delete(1)).toThrow(
        "This resource does not support deleting entities"
      );
    });
  });
});
