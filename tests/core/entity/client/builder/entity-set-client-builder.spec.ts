import { createOperatorFactory, HttpClientAdapter, ODataClient } from "../../../../../src";
import { toPromise } from "../../../../../src/utils/promise";

interface Model {
  id: number;
  name: string;
}

const o = createOperatorFactory();

describe('EntitySetBuilderImpl', () => {
  it('should allow building an entity set', () => {
    const builder = new ODataClient({
      http: { headers: {} },
      serviceUrl: "https://localhost:9000",
      routingType: "parentheses",
    }).entitySet<Model>("models");

    const set = builder
      .withKey("id")
      .withKeyType(o.int)
      .withReadSet("GET")
      .withRead("GET")
      .withCreate("POST")
      .withUpdate("PATCH")
      .withDelete("DELETE")
      .withValidator(value => value as Model)
      .build();

    expect(set).toBeTruthy();
    expect(set).toHaveProperty("set");
    expect(set).toHaveProperty("read");
    expect(set).toHaveProperty("create");
    expect(set).toHaveProperty("update");
    expect(set).toHaveProperty("delete");
  });

  it('should use the default http adapter if none is specified', () => {
    const builder = new ODataClient({
      http: { headers: {} },
      serviceUrl: "https://localhost:9000",
      routingType: "parentheses",
    }).entitySet<Model>("models");

    const set = builder
      .withKey("id")
      .withKeyType(o.int)
      .build();

    expect(set).toBeTruthy();
    expect((set as any)["options"]["rootOptions"]["http"]["adapter"]).toBeUndefined();
  });

  it('should use the provided http adapter if one is specified', () => {
    const adapter: HttpClientAdapter = {
      invoke() {
        return toPromise({
          status: 200,
          data: toPromise(''),
        });
      },
    };

    const builder = new ODataClient({
      http: { adapter: adapter },
      serviceUrl: "https://localhost:9000",
      routingType: "parentheses",
    }).entitySet<Model>("models");

    const set = builder
      .withKey("id")
      .withKeyType(o.int)
      .build();

    expect(set).toBeTruthy();
    expect((set as any)["options"]["rootOptions"]["http"]["adapter"]).toBe(adapter);
  });
});
