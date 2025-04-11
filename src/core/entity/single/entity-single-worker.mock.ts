import { toIdString } from "../../../utils/id";
import { toPromise } from "../../../utils/promise";
import { NewMockODataClientOptions } from "../../client/odata-client.mock";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntityResponse } from "../response/entity-response";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerMockOptions<TEntity> {
  rootOptions: NewMockODataClientOptions;
  entitySet: string;
  id: unknown | unknown[];
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

export class EntitySingleWorkerMock<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly options;
  private readonly entitySet;

  constructor(
    options: EntitySingleWorkerMockOptions<TEntity>,
  ) {
    this.options = options;
    this.entitySet = options.rootOptions.entitySets[options.entitySet];
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    const useId = toIdString(this.options.id);
    const allData = this.entitySet.data();

    let data: TEntity = allData[useId];
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
