import { ODataClient } from "../../../../src";

interface Model {
  id: number;
  name: string;
}

describe('ODataClient', () => {
  it('should return a builder', () => {
    const client = new ODataClient({
      http: { headers: {} },
      serviceUrl: "https://localhost:9000",
      routingType: "parentheses",
    });

    const builder = client.entitySet<Model>("models");

    expect(builder).toBeTruthy();
  });
});
