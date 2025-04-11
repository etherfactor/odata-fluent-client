import { ODataOptions, OrderBy } from "../../../../src";
import { EntitySetWorkerMock, EntitySetWorkerMockOptions } from "../../../../src/core/entity/set/entity-set-worker.mock";

interface TestEntity {
  id: number;
  name: string;
  age: number;
}

describe("EntitySetWorkerMock", () => {
  const sampleData: Record<string, TestEntity> = {
    a: { id: 1, name: "Alice", age: 30 },
    b: { id: 2, name: "Bob", age: 25 },
    c: { id: 3, name: "Charlie", age: 35 },
  };

  let worker: EntitySetWorkerMock<TestEntity>;

  beforeEach(() => {
    const options: EntitySetWorkerMockOptions<TestEntity> = {
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
    };
    worker = new EntitySetWorkerMock(options);
  });

  it("should return all data with default options", async () => {
    const options: ODataOptions = {};

    const result = worker.execute(options);
    const data = await result.data;
    expect(data).toEqual(Object.values(sampleData));

    const count = await result.count;
    expect(count).toBeUndefined();

    const iterated: TestEntity[] = [];
    for await (const item of result.iterator) {
      iterated.push(item);
    }
    expect(iterated).toEqual(data);
  });

  it("should apply filter correctly", async () => {
    const options: ODataOptions = {
      filter: [
        { eval: (datum: TestEntity) => datum.age > 30 }
      ]
    };

    const result = worker.execute(options);
    const data = await result.data;
    expect(data).toEqual([{ id: 3, name: "Charlie", age: 35 }]);
  });

  it("should return correct count when count option is true", async () => {
    const options: ODataOptions = {
      count: true
    };

    const result = worker.execute(options);
    const count = await result.count;
    expect(count).toEqual(Object.values(sampleData).length);
  });

  it("should apply orderBy correctly", async () => {
    const options: ODataOptions = {
      orderBy: [
        { property: "age", direction: "asc" }
      ]
    };

    const resultAsc = worker.execute(options);
    const dataAsc = await resultAsc.data;
    const expectedAsc = Object.values(sampleData).sort((a, b) => a.age - b.age);
    expect(dataAsc).toEqual(expectedAsc);

    const orderByDesc: OrderBy[] = [{ property: "age", direction: "desc" }];
    const resultDesc = worker.execute({ orderBy: orderByDesc });
    const dataDesc = await resultDesc.data;
    const expectedDesc = Object.values(sampleData).sort((a, b) => b.age - a.age);
    expect(dataDesc).toEqual(expectedDesc);
  });

  it("should apply skip and top correctly", async () => {
    const options: ODataOptions = {
      orderBy: [
        { property: "id", direction: "asc" }
      ],
      skip: 1,
      top: 1
    };

    const result = worker.execute(options);
    const data = await result.data;
    
    const expected = Object.values(sampleData)
      .sort((a, b) => a.id - b.id)
      .slice(1, 2);
    expect(data).toEqual(expected);
  });

  it("should apply select correctly", async () => {
    const options: ODataOptions = {
      select: [
        "id",
        "name"
      ]
    };

    const result = worker.execute(options);
    const data = await result.data;

    const expected = Object.values(sampleData).map(entity => ({ id: entity.id, name: entity.name }));
    expect(data).toEqual(expected);
  });

  it("should apply combined options correctly", async () => {
    //Combine filter, orderBy, skip/top, select, and count.
    //Filter: include only entities with age >= 30.
    //Order by name descending.
    //Skip 0, top 2.
    //Select only the "id" property.
    //Request count.
    const options: ODataOptions = {
      filter: [
        { eval: (datum: TestEntity) => datum.age >= 30 }
      ],
      orderBy: [
        { property: "name", direction: "desc" }
      ],
      skip: 0,
      top: 2,
      select: ["id"],
      count: true,
    };

    const result = worker.execute(options);
    const data = await result.data;
    const count = await result.count;
    //Filtered entities: Alice (age 30) and Charlie (age 35).
    //Ordering by name descending gives: [Charlie, Alice].
    //Selecting only id yields: [{ id: 3 }, { id: 1 }].
    expect(count).toEqual(2);
    expect(data).toEqual([{ id: 3 }, { id: 1 }]);
  });
});
