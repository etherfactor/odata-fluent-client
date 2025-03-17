import { createOperatorFactory, EntitySet } from "../../../src";
import { EntitySetImpl, EntitySetWorkerImpl } from "../../../src/core/entity/entity-set";
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

describe('EntitySetImpl', () => {
  let set: EntitySet<Model>;

  beforeEach(() => {
    const worker = new EntitySetWorkerImpl<Model>({
      adapter: undefined!,
      method: "GET",
      url: "/v1/models",
    });
    set = new EntitySetImpl<Model>(worker);
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

  it('should filter simple properties', () => {
    const filtered = set.filter(e =>
      o.eq(
        e.prop('id'),
        o.guid('00000000-0000-0000-0000-000000000000' as Guid),
      )
    );

    const params = getParams(filtered.getOptions());
    expect(params['$filter']).toBe("id eq 00000000-0000-0000-0000-000000000000");
  });

  it('should filter multiple properties', () => {
    const filtered = set.filter(e =>
      o.and(
        o.eq(
          e.prop('quantity'),
          o.int(1)
        ),
        o.eq(
          e.prop('isActive'),
          o.bool(true)
        )
      )
    );

    const params = getParams(filtered.getOptions());
    expect(params['$filter']).toBe("(quantity eq 1 and isActive eq true)");
  });

  it('should filter with nested and/or', () => {
    const filtered = set.filter(e =>
      o.or(
        o.and(
          o.eq(
            e.prop('quantity'),
            o.int(1)
          ),
          o.eq(
            e.prop('isActive'),
            o.bool(true)
          )
        ),
        o.and(
          o.eq(
            e.prop('quantity'),
            o.int(0)
          ),
          o.eq(
            e.prop('isActive'),
            o.bool(false)
          )
        )
      )
    );

    const params = getParams(filtered.getOptions());
    expect(params['$filter']).toBe("((quantity eq 1 and isActive eq true) or (quantity eq 0 and isActive eq false))");
  });

  it('should filter with any operand', () => {
    const filtered = set.filter(e =>
      e.any('values', a =>
        o.and(
          o.eq(
            a.prop('key'),
            o.string('key')
          ),
          o.eq(
            a.prop('value'),
            o.string('value')
          )
        )
      )
    );

    const params = getParams(filtered.getOptions());
    expect(params['$filter']).toBe("values/any(e0: (e0/key eq 'key' and e0/value eq 'value'))")
  });

  it('should orderby with one property', () => {
    const ordered = set.orderBy('quantity', 'asc');

    const params = getParams(ordered.getOptions());
    expect(params['$orderby']).toBe("quantity asc");
  });

  it('should orderby with multiple properties', () => {
    const ordered = set.orderBy('name', 'asc')
      .thenBy('quantity', 'desc');

    const params = getParams(ordered.getOptions());
    expect(params['$orderby']).toBe("name asc, quantity desc");
  });

  it('should orderby with default asc', () => {
    const ordered = set.orderBy('name');

    const params = getParams(ordered.getOptions());
    expect(params['$orderby']).toBe("name asc");
  });

  it('should orderby and reset when called twice', () => {
    const ordered = set.orderBy('quantity')
      .orderBy('name');

    const params = getParams(ordered.getOptions());
    expect(params['$orderby']).toBe("name asc");
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

  it('should skip', () => {
    const skipped = set.skip(20);

    const params = getParams(skipped.getOptions());
    expect(params['$skip']).toBe("20");
  });

  it('should top', () => {
    const topped = set.top(20);

    const params = getParams(topped.getOptions());
    expect(params['$top']).toBe("20");
  });

  it('should process multiple options simultaneously', () => {
    const result = set
      .filter(e =>
        o.or(
          o.and(
            o.eq(
              e.prop('quantity'),
              o.int(1)
            ),
            o.eq(
              e.prop('isActive'),
              o.bool(true)
            )
          ),
          o.and(
            o.eq(
              e.prop('quantity'),
              o.int(0)
            ),
            o.eq(
              e.prop('isActive'),
              o.bool(false)
            )
          )
        )
      )
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
      .orderBy('name')
      .thenBy('description')
      .top(20)
      .skip(20);

    const params = getParams(result.getOptions());
    expect(params['$filter']).toBe("((quantity eq 1 and isActive eq true) or (quantity eq 0 and isActive eq false))");
    expect(params['$orderby']).toBe("name asc, description asc");
    expect(params['$skip']).toBe("20");
    expect(params['$top']).toBe("20");
    expect(params['$expand']).toBe("values($filter=value eq 'test'; $orderby=value asc)");
  });

  it('should allow separate chaining', () => {
    const step1 = set.filter(e =>
      o.eq(
        e.prop('id'),
        o.guid('00000000-0000-0000-0000-000000000000' as Guid),
      )
    );

    const params1 = getParams(step1.getOptions());
    expect(params1['$filter']).toBe("id eq 00000000-0000-0000-0000-000000000000");

    const step2 = step1.orderBy('quantity', 'asc');

    const params2 = getParams(step2.getOptions());
    expect(params2['$filter']).toBe("id eq 00000000-0000-0000-0000-000000000000");
    expect(params2['$orderby']).toBe("quantity asc");

    const step3 = step1.orderBy('name', 'asc')
      .thenBy('quantity', 'desc');

    const params3 = getParams(step3.getOptions());
    expect(params3['$filter']).toBe("id eq 00000000-0000-0000-0000-000000000000");
    expect(params3['$orderby']).toBe("name asc, quantity desc");
  });
});
