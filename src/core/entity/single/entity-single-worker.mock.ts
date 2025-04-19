import { toPromise } from "../../../utils/promise";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntityResponse } from "../../response/entity-response";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerMockOptions<TEntity> {
  rootOptions: MockODataClientOptions;
  getData: () => TEntity;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

/**
 * A mock entity single worker.
 */
export class EntitySingleWorkerMock<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly options;

  constructor(
    options: EntitySingleWorkerMockOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    let data = this.options.getData();
    data = this.applySelect(data, options.select ?? []);

    return {
      data: toPromise(data),
      result: toPromise(true),
    };
  }

  /**
   * Selects the specified properties.
   * @param data The data to trim.
   * @param select The properties to select.
   * @returns The selected properties.
   */
  private applySelect(data: TEntity, select: Select[]) {
    if (select.length === 0)
      return data;

    const finalData: TEntity = {} as TEntity;
    for (const property of select) {
      finalData[property as keyof TEntity] = data[property as keyof TEntity];
    }

    return finalData;
  }
}
