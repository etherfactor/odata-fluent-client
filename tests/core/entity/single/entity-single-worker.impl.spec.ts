import { HttpClientAdapter, ODataOptions } from "../../../../src";
import { EntitySingleWorkerImpl, EntitySingleWorkerImplOptions } from "../../../../src/core/entity/single/entity-single-worker.impl";
import { toIterable } from "../../../../src/utils/promise";

interface TestEntity {
  id: number;
  name: string;
}

describe("EntitySingleWorkerImpl", () => {
  it("should return entity from promise response", async () => {
    const entity: TestEntity = {
      id: 1,
      name: "PromiseTest"
    };

    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve(entity)
      })
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: (value, selectExpand) => value as TestEntity
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual(entity);
  });

  it("should return entity from streaming response", async () => {
    const entity: TestEntity = {
      id: 2,
      name: "StreamingTest"
    };

    const jsonString = JSON.stringify(entity);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: (value, selectExpand) => value as TestEntity
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual(entity);
  });

  it("should return entity without validators from promise response", async () => {
    const entity: TestEntity = {
      id: 1,
      name: "PromiseTest"
    };

    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve(entity)
      })
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: undefined
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual(entity);
  });

  it("should return entity without validators from streaming response", async () => {
    const entity: TestEntity = {
      id: 2,
      name: "StreamingTest"
    };

    const jsonString = JSON.stringify(entity);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: undefined
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    const data = await response.data;
    expect(data).toEqual(entity);
  });

  it("should reject when validator returns an error in promise response", async () => {
    const entity: TestEntity = {
      id: 3,
      name: "InvalidEntity"
    };
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve(entity)
      })
    };

    const errorValidator = (value: unknown, selectExpand: any) => {
      return new Error("Validation failed");
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: errorValidator
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    await expect(response.data).rejects.toThrow("Validation failed");
  });

  it("should reject when validator returns an error in streaming response", async () => {
    const entity: TestEntity = {
      id: 3,
      name: "InvalidEntity"
    };
    
    const jsonString = JSON.stringify(entity);
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: toIterable([jsonString])
      })
    };

    const errorValidator = (value: unknown, selectExpand: any) => {
      return new Error("Validation failed");
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/entity",
      headers: { "Content-Type": "application/json" },
      payload: undefined,
      validator: errorValidator
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);

    const options: ODataOptions = {
      select: []
    };

    const response = worker.execute(options);
    await expect(response.data).rejects.toThrow("Validation failed");
  });

  it("should call adapter.invoke with the correct configuration", async () => {
    const entity: TestEntity = { id: 4, name: "ConfigTest" };
    const mockAdapter: HttpClientAdapter = {
      invoke: jest.fn().mockResolvedValue({
        status: 200,
        data: Promise.resolve(entity)
      })
    };

    const workerOpt: EntitySingleWorkerImplOptions<TestEntity> = {
      adapter: mockAdapter,
      method: "GET",
      url: "http://example.com/resource",
      headers: { Authorization: "Bearer token" },
      payload: { extra: "data" } as unknown as TestEntity,
      validator: (value, selectExpand) => value as TestEntity
    };
    const worker = new EntitySingleWorkerImpl(workerOpt);
    
    const options: ODataOptions = {
      select: [
        "id"
      ]
    };

    const response = worker.execute(options);
    await response.data;

    expect(mockAdapter.invoke).toHaveBeenCalledWith({
      method: "GET",
      url: "http://example.com/resource",
      headers: { Authorization: "Bearer token" },
      query: { $select: "id" },
      body: { extra: "data" }
    });
  });
});
