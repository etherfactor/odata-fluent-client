import { JSONParser } from "@streamparser/json";
import { AsyncQueue } from "../../utils/async-queue";
import { HttpMethod } from "../../utils/http";
import { toIterable, toPromise } from "../../utils/promise";
import { InferArrayType, SafeAny } from "../../utils/types";
import { Value } from "../../values/base";
import { HttpClientAdapter } from "../http-client-adapter";
import { Count, Expand, Filter, ODataOptions, OrderBy, Select, Skip, SortDirection, Top, getParams, selectExpandToObject } from "../params";
import { PrefixGenerator } from "../prefix-generator";
import { EntityAccessor, EntityAccessorImpl } from "./entity-accessor";
import { EntityExpand, EntityExpandImpl } from "./entity-expand";
import { EntitySetResponse } from "./entity-response";
import { EntitySelectExpand } from "./entity-select-expand";

export interface EntitySet<TEntity> {
  count(): EntitySet<TEntity>;
  execute(): EntitySetResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySet<TEntity>;
  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity>;
  orderBy(property: keyof TEntity & string, direction?: SortDirection): OrderedEntitySet<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>>;
  skip(count: number): EntitySet<TEntity>;
  top(count: number): EntitySet<TEntity>;
  getOptions(): ODataOptions;
}

export interface OrderedEntitySet<TEntity> extends EntitySet<TEntity> {
  thenBy(property: keyof TEntity & string, direction?: SortDirection): EntitySet<TEntity>;
}

export class EntitySetImpl<TEntity> implements EntitySet<TEntity>, OrderedEntitySet<TEntity> {

  protected readonly worker: EntitySetWorker<TEntity>;
  protected readonly countValue?: Count;
  protected readonly expandValue?: Expand[];
  protected readonly filterValue?: Filter[];
  protected readonly orderByValue?: OrderBy[];
  protected readonly selectValue?: Select[];
  protected readonly skipValue?: Skip;
  protected readonly topValue?: Top;

  constructor(
    worker: EntitySetWorker<TEntity>,
    options?: ODataOptions,
  ) {
    this.worker = worker;
    this.countValue = options?.count;
    this.expandValue = options?.expand;
    this.filterValue = options?.filter;
    this.orderByValue = options?.orderBy;
    this.selectValue = options?.select;
    this.skipValue = options?.skip;
    this.topValue = options?.top;
  }

  protected new<TNewEntity = TEntity>(worker: EntitySetWorker<TNewEntity>, options?: ODataOptions): EntitySetImpl<TNewEntity> {
    return new EntitySetImpl(this.worker as unknown as EntitySetImpl<TNewEntity>, options);
  }

  count(): EntitySet<TEntity> {
    const options = this.getOptions();
    options.count = true;

    return this.new<TEntity>(this.worker, options);
  }

  expand<TExpanded extends keyof TEntity & string, TNewExpanded>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<TNewExpanded>): EntitySet<TEntity> {
    let expander: SafeAny = new EntityExpandImpl<InferArrayType<TEntity[TExpanded]>>(property);
    if (builder) {
      expander = builder(expander);
    }

    const expand: Expand = { property, value: expander };
    const newExpand = [...(this.expandValue ?? []), expand];

    const options = this.getOptions();
    options.expand = newExpand;

    return this.new<TEntity>(this.worker, options);
  }

  filter(builder: (entity: EntityAccessor<TEntity>) => Value<boolean>): EntitySet<TEntity> {
    const generator = new PrefixGenerator;
    const accessor = new EntityAccessorImpl<TEntity>(generator);

    const filter = builder(accessor);
    const newFilters = [...(this.filterValue ?? []), filter];

    const options = this.getOptions();
    options.filter = newFilters;

    return this.new<TEntity>(this.worker, options);
  }

  orderBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntitySet<TEntity> {
    const options = this.getOptions();
    options.orderBy = [{ property, direction: direction ?? 'asc' }];

    return this.new<TEntity>(this.worker, options);
  }

  thenBy(property: keyof TEntity & string, direction?: 'asc' | 'desc'): OrderedEntitySet<TEntity> {
    const options = this.getOptions();
    options.orderBy?.push({ property, direction: direction ?? 'asc' });

    return this.new<TEntity>(this.worker, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySet<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    options.select ??= [];
    options.select = [...options.select, ...properties];

    return this.new<Pick<TEntity, TSelected>>(this.worker, options);
  }

  skip(count: number): EntitySet<TEntity> {
    const options = this.getOptions();
    options.skip = count;

    return this.new(this.worker, options);
  }

  top(count: number): EntitySet<TEntity> {
    const options = this.getOptions();
    options.top = count;

    return this.new<TEntity>(this.worker, options);
  }

  getOptions(): ODataOptions {
    return {
      count: this.countValue,
      expand: this.expandValue,
      filter: this.filterValue,
      orderBy: this.orderByValue,
      select: this.selectValue,
      skip: this.skipValue,
      top: this.topValue,
    };
  }

  execute(): EntitySetResponse<TEntity> {
    return this.worker.execute(this.getOptions());
  }
}

export interface EntitySetWorker<TEntity> {
  execute(options: ODataOptions): EntitySetResponse<TEntity>;
}

export interface EntitySetWorkerImplOptions<TEntity> {
  adapter: HttpClientAdapter;
  method: HttpMethod;
  url: string;
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

export class EntitySetWorkerImpl<TEntity> implements EntitySetWorker<TEntity> {

  private readonly options: EntitySetWorkerImplOptions<TEntity>;

  constructor(
    options: EntitySetWorkerImplOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntitySetResponse<TEntity> {
    const params = getParams(options);

    const result = this.options.adapter.invoke({
      method: this.options.method,
      url: this.options.url,
      headers: {},
      query: params,
      body: this.options.payload,
    });

    let resolveCount: (count: number) => void;
    let rejectCount: (err: Error) => void;
    const countPromise = new Promise<number>((resolve, reject) => {
      resolveCount = resolve;
      rejectCount = reject;
    });

    let resolveData: (data: TEntity[]) => void;
    let rejectData: (err: Error) => void;
    const dataPromise = new Promise<TEntity[]>((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });

    const entities: TEntity[] = [];
    const queue = new AsyncQueue<TEntity>();

    const selectExpand = selectExpandToObject(options);

    const parser = new JSONParser();
    
    parser.onValue = ({ value, key, parent, stack }) => {
      if (stack && stack.length === 1 && key === "@odata.count") {
        resolveCount(value as number);
      }

      if (stack && stack.length === 2 && stack[1].key === "value") {
        if (this.options.validator) {
          const parseResult = this.options.validator(value, selectExpand);
          if (parseResult instanceof Error)
            throw parseResult;

          queue.push(parseResult);
          entities.push(parseResult);
        } else {
          queue.push(value as TEntity);
          entities.push(value as TEntity);
        }
      }
    };

    const onError = (err: Error): void => {
      rejectCount(err);
      rejectData(err);
      queue.fail(err);
    };

    parser.onError = onError;

    const onEnd = (): void => {
      resolveData(entities);
      rejectCount(new Error("Count was not received from the server"));
      queue.complete();
    }

    parser.onEnd = onEnd;

    (async () => {
      try {
        const response = await result;

        if (response.data instanceof Promise) {
          const data = await response.data as SafeAny;
          for (const value of data["value"]) {
            if (this.options.validator) {
              const parseResult = this.options.validator(value, selectExpand);
              if (parseResult instanceof Error)
                throw parseResult;

              entities.push(parseResult);
            } else {
              entities.push(value);
            }
          }
        } else {
          for await (const chunk of response.data) {
            if (/\S/.test(chunk)) {
              parser.write(chunk.trim());
            }
          }
        }
      } catch (err) {
        onError(err as Error);
      }
    })();

    return {
      count: countPromise,
      data: dataPromise,
      iterator: queue,
    }
  }
}

export class EntitySetWorkerMock<TEntity> implements EntitySetWorker<TEntity> {

  private getData: () => TEntity[];

  constructor(
    getData: () => TEntity[],
  ) {
    this.getData = getData;
  }

  execute(options: ODataOptions): EntitySetResponse<TEntity> {
    const data = {
      "@odata.count": undefined as number | undefined,
      value: this.getData()
    };
    
    data.value = this.applyFilters(data.value, options.filter ?? []);
    if (options.count) {
      data["@odata.count"] = data.value.length;
    }
    data.value = this.applyOrderBy(data.value, options.orderBy ?? []);
    data.value = this.applySkipTop(data.value, options.skip ?? 0, options.top ?? 100);
    data.value = this.applySelect(data.value, options.select ?? []);

    return {
      count: toPromise(data["@odata.count"]!),
      data: toPromise(data.value),
      iterator: toIterable(data.value),
    };
  }

  private applyFilters(data: TEntity[], filters: Filter[]): TEntity[] {
    let finalData = data;
    for (const filter of filters) {
      finalData = finalData.filter(datum => filter.eval(datum));
    }

    return finalData;
  }
  
  private applyOrderBy(data: TEntity[], orderBy: OrderBy[]): TEntity[] {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      for (const orderByProp of orderBy) {
        const prop = orderByProp.property as keyof TEntity;
        let aValue = a[prop];
        let bValue = b[prop];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase() as SafeAny;
        }

        if (typeof bValue === "string") {
          bValue = bValue.toLowerCase() as SafeAny;
        }

        if (aValue < bValue) {
          return orderByProp.direction === "asc" ? -1 : 1;
        }

        if (aValue > bValue) {
          return orderByProp.direction === "asc" ? 1 : -1;
        }
      }

      return 0;
    });

    return sortedData;
  }

  private applySkipTop(data: TEntity[], skip: Skip, top: Top) {
    const startAt = skip;
    const endAt = startAt + top;
    const finalData = data.slice(startAt, endAt);

    return finalData;
  }

  private applySelect(data: TEntity[], select: Select[]) {
    if (select.length === 0)
      return data;

    const finalData = data.map(datum => {
      const newObj: TEntity = {} as TEntity;
      for (const property of select) {
        newObj[property as keyof TEntity] = datum[property as keyof TEntity];
      }

      return newObj;
    });

    return finalData;
  }
}
