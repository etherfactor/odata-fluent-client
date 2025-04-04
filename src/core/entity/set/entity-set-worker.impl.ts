import { JSONParser } from "@streamparser/json";
import { AsyncQueue } from "../../../utils/async-queue";
import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { HttpClientAdapter } from "../../http/http-client-adapter";
import { selectExpandToObject } from "../../parameters/expand";
import { getParams, ODataOptions } from "../../parameters/odata-options";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySetResponse } from "../response/entity-response";
import { EntitySetWorker } from "./entity-set-worker";

export interface EntitySetWorkerImplOptions<TEntity> {
  adapter: HttpClientAdapter;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
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
      headers: this.options.headers,
      query: params,
      body: this.options.payload,
    });

    let resolveCount!: (count: number) => void;
    let rejectCount!: (err: Error) => void;
    const countPromise = new Promise<number>((resolve, reject) => {
      resolveCount = resolve;
      rejectCount = reject;
    });

    let resolveData!: (data: TEntity[]) => void;
    let rejectData!: (err: Error) => void;
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
          if ("@odata.count" in data) {
            resolveCount(data["@odata.count"]);
          }
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
          resolveData(entities);
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
