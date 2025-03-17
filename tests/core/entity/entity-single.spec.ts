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
  altValues: SubModel[];
}

interface SubModel {
  key: string;
  value?: string;
  related: SubModel[];
  altRelated: SubModel[];
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

  it('should expand with count', () => {
    const expanded = set.expand('values', x =>
      x.count()
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($count=true)")
  });

  it('should expand with expand', () => {
    const expanded = set.expand('values', x =>
      x.expand("related", x2 => x2)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($expand=related)")
  });

  it('should expand with multiple expands', () => {
    const expanded = set.expand('values', x =>
      x.expand("related", x2 => x2)
        .expand("altRelated")
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($expand=related, altRelated)")
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

  it('should expand with multiple filters', () => {
    const expanded = set.expand('values', x =>
      x.filter(e =>
        o.eq(
          e.prop('key'),
          o.string('key')
        )
      ).filter(e =>
        o.eq(
          e.prop('value'),
          o.string('value')
        )
      )
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($filter=(key eq 'key' and value eq 'value'))")
  });

  it('should expand with orderby', () => {
    const expanded = set.expand('values', x =>
      x.orderBy('value')
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($orderby=value asc)");
  });

  it('should expand with multiple orderbys', () => {
    const expanded = set.expand('values', x =>
      x.orderBy('value', 'desc')
        .thenBy('key', 'asc')
        .thenBy('value')
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($orderby=value desc, key asc, value asc)");
  });

  it('should expand with select', () => {
    const expanded = set.expand('values', x =>
      x.select("key")
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($select=key)");
  });

  it('should expand with multiple selects', () => {
    const expanded = set.expand('values', x =>
      x.select("key", "value")
        .select("value")
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($select=value)");
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

  it('should expand with multiple options', () => {
    const expanded = set.expand('values', x =>
      x.top(20)
        .skip(20)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($skip=20; $top=20)");
  });

  it('should expand multiple times', () => {
    const expanded = set.expand('values', x =>
      x.top(20)
        .skip(10)
    ).expand('altValues', x =>
      x.top(10)
        .skip(20)
    );

    const params = getParams(expanded.getOptions());
    expect(params['$expand']).toBe("values($skip=10; $top=20), altValues($skip=20; $top=10)");
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
