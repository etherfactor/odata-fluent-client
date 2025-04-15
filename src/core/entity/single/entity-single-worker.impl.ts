import { JSONParser } from "@streamparser/json";
import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { DefaultHttpClientAdapter } from "../../http/http-client-adapter";
import { selectExpandToObject } from "../../parameters/expand";
import { getParams, ODataOptions } from "../../parameters/odata-options";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntityResponse } from "../response/entity-response";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerImplOptions<TEntity> {
  rootOptions: ODataClientOptions;
  method: HttpMethod;
  url: string;
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

export class EntitySingleWorkerImpl<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly options: EntitySingleWorkerImplOptions<TEntity>;

  constructor(
    options: EntitySingleWorkerImplOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    const params = getParams(options);

    const adapter = this.options.rootOptions.http.adapter ?? DefaultHttpClientAdapter;
    const result = adapter.invoke({
      method: this.options.method,
      url: this.options.url,
      headers: this.options.rootOptions.http.headers ?? {},
      query: params,
      body: this.options.payload,
    });

    let resolveData!: (data: TEntity) => void;
    let rejectData!: (err: Error) => void;
    const dataPromise = new Promise<TEntity>((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });

    let entity!: TEntity;

    const selectExpand = selectExpandToObject(options);

    const parser = new JSONParser();
    
    parser.onValue = ({ value, key, parent, stack }) => {
      if (stack && stack.length === 0) {
        if (this.options.validator) {
          const parseResult = this.options.validator(value, selectExpand);
          if (parseResult instanceof Error)
            throw parseResult;

          entity = parseResult;
        } else {
          entity = value as TEntity;
        }
      }
    };

    const onError = (err: Error): void => {
      rejectData(err);
    };

    parser.onError = onError;

    const onEnd = (): void => {}

    parser.onEnd = onEnd;

    (async () => {
      try {
        const response = await result;

        if (response.data instanceof Promise) {
          const value = await response.data as SafeAny;
          if (this.options.validator) {
            const parseResult = this.options.validator(value, selectExpand);
            if (parseResult instanceof Error)
              throw parseResult;

            entity = parseResult;
          } else {
            entity = value;
          }
        } else {
          for await (const chunk of response.data) {
            if (/\S/.test(chunk)) {
              parser.write(chunk.trim());
            }
          }
        }

        resolveData(entity);
      } catch (err) {
        onError(err as Error);
      }
    })();

    return {
      data: dataPromise,
    };
  }
}
