import { createOperatorFactory } from "../../../src";
import { EntitySingle, EntitySingleImpl, EntitySingleWorkerImpl } from "../../../src/core/entity/entity-single";
import { getParams } from "../../../src/core/params";
import { Guid } from "../../../src/types/guid";

interface Model {
  id: Guid;
  quantity: number;
  isActive: boolean;
  name: string;
  description?: string;
  values: SubModel[];
}

interface SubModel {
  key: string;
  value?: string;
}

const o = createOperatorFactory();

describe('EntitySingleImpl', () => {
  let set: EntitySingle<Model>;

  beforeEach(() => {
    const worker = new EntitySingleWorkerImpl<Model>({
      adapter: undefined!,
      method: "GET",
      url: "/v1/models",
    });
    set = new EntitySingleImpl<Model>(worker);
  });

  it('should expand simple properties', () => {
    const expanded = set.expand('values');

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values");
  });

  it('should expand with filter', () => {
    const expanded = set.expand('values', x =>
      x.filter(e =>
        o.eq(
          e.prop('key'),
          o.string('key')
        )
      )
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($filter=key eq 'key')")
  });

  it('should expand with orderby', () => {
    const expanded = set.expand('values', x =>
      x.orderBy('value')
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($orderby=value asc)");
  });

  it('should expand with skip', () => {
    const expanded = set.expand('values', x =>
      x.skip(20)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($skip=20)");
  });

  it('should expand with top', () => {
    const expanded = set.expand('values', x =>
      x.top(20)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($top=20)");
  });

  it('should expand with multiple', () => {
    const expanded = set.expand('values', x =>
      x.top(20)
        .skip(20)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($skip=20; $top=20)");
  });

  it('should select single properties', () => {
    const selected = set.select('name', 'quantity');

    const params = getParams(selected.getOptions());
    expect(params['$select']).toBe("name, quantity");
  });

  it('should select multiple properties', () => {
    const selected = set.select('name', 'quantity');

    const params = getParams(selected.getOptions());
    expect(params['$select']).toBe("name, quantity");
  });

  it('should process multiple options simultaneously', () => {
    const result = set
      .expand('values', x =>
        x
          .filter(e =>
            o.eq(
              e.prop('value'),
              o.string('test')
            )
          )
          .orderBy('value')
      )
      .select("id", "name");

    const params = getParams(result.getOptions());
    expect(params['$expand']).toBe("values($filter=value eq 'test'; $orderby=value asc)");
    expect(params['$select']).toBe("id, name");
  });

  it('should allow separate chaining', () => {
    const step1 = set.expand('values', x =>
      x
        .filter(e =>
          o.eq(
            e.prop('value'),
            o.string('test')
          )
        )
        .orderBy('value')
    );

    const params1 = getParams(step1.getOptions());
    expect(params1['$expand']).toBe("values($filter=value eq 'test'; $orderby=value asc)");

    const step2 = step1.select("id");

    const params2 = getParams(step2.getOptions());
    expect(params2['$expand']).toBe("values($filter=value eq 'test'; $orderby=value asc)");
    expect(params2['$select']).toBe("id");

    const step3 = step1.select("id", "name");

    const params3 = getParams(step3.getOptions());
    expect(params3['$expand']).toBe("values($filter=value eq 'test'; $orderby=value asc)");
    expect(params3['$select']).toBe("id, name");
  });
});
