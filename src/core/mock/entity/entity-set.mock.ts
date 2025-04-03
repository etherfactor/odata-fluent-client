import { toIterable, toPromise } from "../../../utils/promise";
import { SafeAny } from "../../../utils/types";
import { EntitySetResponse } from "../../entity/entity-response";
import { EntitySelectExpand } from "../../entity/entity-select-expand";
import { EntitySetWorker } from "../../entity/entity-set";
import { Filter, ODataOptions, OrderBy, Select, Skip, Top } from "../../params";

export class EntitySetWorkerMock<TEntity> implements EntitySetWorker<TEntity> {

  private readonly config;

  constructor(
    config: EntitySetWorkerMockOptions<TEntity>,
  ) {
    this.config = config;
  }

  execute(options: ODataOptions): EntitySetResponse<TEntity> {
    const data = {
      "@odata.count": undefined as number | undefined,
      value: Object.values(this.config.getData())
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

export interface EntitySetWorkerMockOptions<TEntity> {
  getData: () => Record<string, TEntity>;
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}
