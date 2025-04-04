import { HttpClientAdapter, ODataOptions } from "../../../../src";
import { EntitySetWorkerImpl, EntitySetWorkerImplOptions } from "../../../../src/core/entity/set/entity-set-worker.impl";
import { toIterable } from "../../../../src/utils/promise";

interface TestEntity {
  id: number;
  name: string;
}

describe("EntitySetWorkerImpl", () => {
  it("should resolve data promise with correct entities from promise response", async () => {
    const entities: TestEntity[] = [
      { id: 1, name: "Entity1" },
      { id: 2, name: "Entity2" },
    ];
    
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve({ value: entities, "@odata.count": 2 })
      })
    };

    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: (value, selectExpand) => value as TestEntity,
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);

    const data = await response.data;
    expect(data).toEqual(entities);

    const count = await response.count;
    expect(count).toBe(2);
  });

  it("should resolve count and data promise with correct values from streaming response", async () => {
    const entities: TestEntity[] = [
      { id: 3, name: "Entity3" },
      { id: 4, name: "Entity4" },
    ];
    const fullResponse = {
      "@odata.count": 2,
      value: entities,
    };

    const jsonString = JSON.stringify(fullResponse);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Accept": "application/json" },
      payload: undefined,
      validator: (value, selectExpand) => value as TestEntity,
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = { select: [] };

    const response = worker.execute(options);
    const count = await response.count;
    expect(count).toEqual(2);
    
    const data = await response.data;
    expect(data).toEqual(entities);

    const iteratedEntities: TestEntity[] = [];
    for await (const item of response.iterator) {
      iteratedEntities.push(item);
    }
    expect(iteratedEntities).toEqual(entities);
  });

  it("should resolve data promise without validator from promise response", async () => {
    const entities: TestEntity[] = [
      { id: 1, name: "Entity1" },
      { id: 2, name: "Entity2" },
    ];
    
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve({ value: entities, "@odata.count": 2 })
      })
    };

    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: undefined,
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);

    const data = await response.data;
    expect(data).toEqual(entities);

    const count = await response.count;
    expect(count).toBe(2);
  });

  it("should resolve data promise without validator from streaming response", async () => {
    const entities: TestEntity[] = [
      { id: 3, name: "Entity3" },
      { id: 4, name: "Entity4" },
    ];
    const fullResponse = {
      "@odata.count": 2,
      value: entities,
    };

    const jsonString = JSON.stringify(fullResponse);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Accept": "application/json" },
      payload: undefined,
      validator: undefined,
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = { select: [] };

    const response = worker.execute(options);
    const count = await response.count;
    expect(count).toEqual(2);
    
    const data = await response.data;
    expect(data).toEqual(entities);

    const iteratedEntities: TestEntity[] = [];
    for await (const item of response.iterator) {
      iteratedEntities.push(item);
    }
    expect(iteratedEntities).toEqual(entities);
  });

  it("should reject promises when validator returns an error in promise response", async () => {
    const entities: TestEntity[] = [
      { id: 1, name: "Entity1" },
      { id: 5, name: "Entity2" },
    ];
    
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve({ value: entities, "@odata.count": 2 })
      })
    };
    
    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: {},
      payload: undefined,
      validator: (value: unknown, selectExpand: any) => {
        const entity = value as TestEntity;
        if (entity.id === 5) {
          return new Error("Invalid entity");
        }
        return entity;
      },
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = {};

    const response = worker.execute(options);
    
    await expect(response.data).rejects.toThrow("Invalid entity");
    await expect(response.count).resolves.toBe(2);
  });

  it("should reject promises when validator returns an error in streaming response", async () => {
    const entities: TestEntity[] = [
      { id: 5, name: "Entity5" },
      { id: 6, name: "Entity6" },
    ];
    const fullResponse = {
      "@odata.count": 2,
      value: entities,
    };

    const jsonString = JSON.stringify(fullResponse);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };
    
    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: {},
      payload: undefined,
      validator: (value: unknown, selectExpand: any) => {
        const entity = value as TestEntity;
        if (entity.id === 5) {
          return new Error("Invalid entity");
        }
        return entity;
      },
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };
    const response = worker.execute(options);
    
    await expect(response.data).rejects.toThrow("Invalid entity");
    await expect(response.count).resolves.toBe(2);
  });

  it("should call adapter.invoke with correct configuration", () => {
    const entities: TestEntity[] = [
      { id: 7, name: "Entity7" }
    ];
    const fullResponse = {
      "@odata.count": 2,
      value: entities,
    };

    const jsonString = JSON.stringify(fullResponse);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const workerOpt: EntitySetWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Custom-Header": "value" },
      payload: { extra: "info" } as unknown as TestEntity,
      validator: (value, selectExpand) => value as TestEntity,
    };
    const worker = new EntitySetWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: [
        "id"
      ]
    };

    worker.execute(options);
    expect(mockAdapter.invoke).toHaveBeenCalledWith({
      method: "GET",
      url: "http://example.com/entities",
      headers: { "Custom-Header": "value" },
      query: { $select: "id" },
      body: { extra: "info" },
    });
  });
});
