import { toIdString } from "../../../utils/id";
import { toPromise } from "../../../utils/promise";
import { ODataOptions } from "../../parameters/odata-options";
import { Select } from "../../parameters/select";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntityResponse } from "../response/entity-response";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerMockOptions<TEntity> {
  getData: () => Record<string, TEntity>;
  id: unknown | unknown[];
  payload?: Partial<TEntity>;
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
    const useId = toIdString(this.options.id);
    const entitySet = this.options.getData();
    let data: TEntity = entitySet[useId];
    
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
