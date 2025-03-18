import { createOperatorFactory } from "../../src";
import { AllCollectionValue, AnyCollectionValue } from "../../src/values/collection";
import { EntityPropertyValue } from "../../src/values/property";

const o = createOperatorFactory();

interface Model {
  id: number;
  name: string;
  description?: string;
  values: SubModel[];
}

interface SubModel {
  value: number;
}

describe('AllCollectionValue', () => {
  it('should eval undefined', () => {
    const value = new AllCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/all(e1: e1/value gt 3)");
    expect(value.eval(undefined)).toBe(false);
  });

  it('should eval non-object', () => {
    const value = new AllCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/all(e1: e1/value gt 3)");
    expect(value.eval(1)).toBe(false);
  });

  it('should eval entity', () => {
    const model: Model = {
      id: 1,
      name: 'Name',
      values: [
        { value: 2 },
        { value: 6 },
      ],
    };
    const value = new AllCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/all(e1: e1/value gt 3)");
    expect(value.eval(model)).toBe(false);
  });
});

describe('AnyCollectionValue', () => {
  it('should eval undefined', () => {
    const value = new AnyCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/any(e1: e1/value gt 3)");
    expect(value.eval(undefined)).toBe(false);
  });

  it('should eval non-object', () => {
    const value = new AnyCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/any(e1: e1/value gt 3)");
    expect(value.eval(1)).toBe(false);
  });

  it('should eval entity', () => {
    const model: Model = {
      id: 1,
      name: 'Name',
      values: [
        { value: 2 },
        { value: 6 },
      ],
    };
    const value = new AnyCollectionValue("values", "e1", o.gt(new EntityPropertyValue<SubModel, "value">("e1", "value"), o.int(3)));
    expect(value.toString()).toBe("values/any(e1: e1/value gt 3)");
    expect(value.eval(model)).toBe(true);
  });
});
