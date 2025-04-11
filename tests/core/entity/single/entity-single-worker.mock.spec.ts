import { ODataOptions, toIdString } from "../../../../src";
import { EntitySingleWorkerMock, EntitySingleWorkerMockOptions } from "../../../../src/core/entity/single/entity-single-worker.mock";

interface TestEntity {
  id: number;
  name: string;
  age: number;
}

describe("EntitySingleWorkerMock", () => {
  const sampleData: Record<string, TestEntity> = {
    "1": { id: 1, name: "Alice", age: 30 },
    "2": { id: 2, name: "Bob", age: 25 },
    "3": { id: 3, name: "Charlie", age: 35 },
  };

  it("should return full entity when no select option provided", async () => {
    const workerOpt: EntitySingleWorkerMockOptions<TestEntity> = {
      rootOptions: {
        entitySets: {
          models: {
            data: () => sampleData,
            id: "id",
            idGenerator: () => 0,
          }
        },
        actions: {},
        functions: {},
      },
      entitySet: "models",
      id: "1",
    };
    const worker = new EntitySingleWorkerMock(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);
    const data = await response.data;

    expect(data).toEqual(sampleData["1"]);
  });

  it("should apply select correctly", async () => {
    const workerOpt: EntitySingleWorkerMockOptions<TestEntity> = {
      rootOptions: {
        entitySets: {
          models: {
            data: () => sampleData,
            id: "id",
            idGenerator: () => 0,
          }
        },
        actions: {},
        functions: {},
      },
      entitySet: "models",
      id: "2",
    };
    const worker = new EntitySingleWorkerMock(workerOpt);
    
    const options: ODataOptions = {
      select: [
        "id",
        "name"
      ]
    };

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual({ id: sampleData["2"].id, name: sampleData["2"].name });
  });

  it("should return undefined for non-existent entity", async () => {
    const workerOpt: EntitySingleWorkerMockOptions<TestEntity> = {
      rootOptions: {
        entitySets: {
          models: {
            data: () => sampleData,
            id: "id",
            idGenerator: () => 0,
          }
        },
        actions: {},
        functions: {},
      },
      entitySet: "models",
      id: "non-existent",
    };
    const worker = new EntitySingleWorkerMock(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toBeUndefined();
  });

  it("should handle array id conversion correctly", async () => {
    const arrayId = [1, 2];
    const arrayIdString = toIdString(arrayId);
    const sampleDataWithArrayId: Record<string, TestEntity> = {
      [arrayIdString]: { id: 12, name: "Dave", age: 40 },
    };

    const workerOpt: EntitySingleWorkerMockOptions<TestEntity> = {
      rootOptions: {
        entitySets: {
          models: {
            data: () => sampleDataWithArrayId,
            id: "id",
            idGenerator: () => 0,
          }
        },
        actions: {},
        functions: {},
      },
      entitySet: "models",
      id: arrayId,
    };
    const worker = new EntitySingleWorkerMock(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual(sampleDataWithArrayId[arrayIdString]);
  });
});
