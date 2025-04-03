import { toIdString } from "../../../utils/id";
import { toPromise } from "../../../utils/promise";
import { EntityResponse } from "../../entity/entity-response";
import { EntitySelectExpand } from "../../entity/entity-select-expand";
import { EntitySingleWorker } from "../../entity/entity-single";
import { ODataOptions, Select } from "../../params";

export class EntitySingleWorkerMock<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly config;

  constructor(
    config: EntitySingleWorkerMockOptions<TEntity>,
  ) {
    this.config = config;
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    const useId = toIdString(this.config.id);
    const entitySet = this.config.getData();
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

export interface EntitySingleWorkerMockOptions<TEntity> {
  getData: () => Record<string, TEntity>;
  id: unknown | unknown[];
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}
