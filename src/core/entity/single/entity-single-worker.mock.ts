import { toPromise } from "../../../utils/promise";
import { NewMockODataClientOptions } from "../../client/odata-client.mock";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntityResponse } from "../response/entity-response";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerMockOptions<TEntity> {
  rootOptions: NewMockODataClientOptions;
  getData: () => TEntity;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

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
    };
  }

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
