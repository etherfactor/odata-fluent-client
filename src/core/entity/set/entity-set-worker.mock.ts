import { toIterable, toPromise } from "../../../utils/promise";
import { SafeAny } from "../../../utils/types";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { Filter } from "../../parameters/filter";
import { ODataOptions } from "../../parameters/odata-options";
import { OrderBy } from "../../parameters/orderby";
import { Select } from "../../parameters/select";
import { Skip } from "../../parameters/skip";
import { Top } from "../../parameters/top";
import { EntitySetResponse } from "../../response/entity-response";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySetWorker } from "./entity-set-worker";

export interface EntitySetWorkerMockOptions<TEntity> {
  rootOptions: MockODataClientOptions;
  getData: () => Record<string, TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

/**
 * A mock entity set worker.
 */
export class EntitySetWorkerMock<TEntity> implements EntitySetWorker<TEntity> {

  private readonly options;

  constructor(
    options: EntitySetWorkerMockOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntitySetResponse<TEntity> {
    //Load the mock data and build a wrapper
    const allData = this.options.getData();
    const data = {
      "@odata.count": undefined as number | undefined,
      value: Object.values(allData)
    };
    
    //Apply query options in order
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
      result: toPromise(true),
    };
  }

  /**
   * Applies filters to the entity set.
   * @param data The data to filter.
   * @param filters The filters to apply.
   * @returns The filtered data.
   */
  private applyFilters(data: TEntity[], filters: Filter[]): TEntity[] {
    let finalData = data;
    for (const filter of filters) {
      finalData = finalData.filter(datum => filter.eval(datum));
    }

    return finalData;
  }
  
  /**
   * Applies sorting to the entity set.
   * @param data The data to sort.
   * @param orderBy The sorting to apply.
   * @returns The sorted data.
   */
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

  /**
   * Skips over a certain number of records and returns a certain number of them.
   * @param data The data to skip.
   * @param skip The number of records to skip.
   * @param top The number of records to return.
   * @returns The skipped/topped records.
   */
  private applySkipTop(data: TEntity[], skip: Skip, top: Top) {
    const startAt = skip;
    const endAt = startAt + top;
    const finalData = data.slice(startAt, endAt);

    return finalData;
  }

  /**
   * Selects the specified properties.
   * @param data The data to trim.
   * @param select The properties to select.
   * @returns The selected properties.
   */
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
