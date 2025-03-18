import { EntityPropertyValue } from "../../src/values/property";

interface Model {
  id: number;
  name: string;
  description?: string;
}

describe('EntityPropertyValue', () => {
  it('should eval undefined', () => {
    const value = new EntityPropertyValue<Model, "id">(undefined, "id");
    expect(value.toString()).toBe("id");
    expect(value.eval(undefined)).toBe(undefined);
  });

  it('should eval non-object', () => {
    const value = new EntityPropertyValue<Model, "id">(undefined, "id");
    expect(value.toString()).toBe("id");
    expect(value.eval(1)).toBe(undefined);
  });

  it('should eval entity', () => {
    const value = new EntityPropertyValue<Model, "id">(undefined, "id");
    expect(value.toString()).toBe("id");
    expect(value.eval({ id: 7 })).toBe(7);
  });
});
