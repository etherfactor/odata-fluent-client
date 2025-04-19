import { JSONParser } from "@streamparser/json";
import { AsyncQueue } from "../../../utils/async-queue";
import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { DefaultHttpClientAdapter } from "../../http/http-client-adapter";
import { selectExpandToObject } from "../../parameters/expand";
import { getParams, ODataOptions } from "../../parameters/odata-options";
import { EntitySetResponse } from "../../response/entity-response";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySetWorker } from "./entity-set-worker";

export interface EntitySetWorkerImplOptions<TEntity> {
  rootOptions: ODataClientOptions;
  method: HttpMethod;
  url: string;
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

/**
 * A physical entity set worker.
 */
export class EntitySetWorkerImpl<TEntity> implements EntitySetWorker<TEntity> {

  private readonly options: EntitySetWorkerImplOptions<TEntity>;

  constructor(
    options: EntitySetWorkerImplOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntitySetResponse<TEntity> {
    //Convert the options into query parameters
    const params = getParams(options);

    //Load the desired HTTP client adapter and invoke the request
    const adapter = this.options.rootOptions.http.adapter ?? DefaultHttpClientAdapter;
    const result = adapter.invoke({
      method: this.options.method,
      url: this.options.url,
      headers: this.options.rootOptions.http.headers ?? {},
      query: params,
      body: this.options.payload,
    });

    //Create a promise and callbacks for the count
    let resolveCount!: (count: number) => void;
    let rejectCount!: (err: Error) => void;
    const countPromise = new Promise<number>((resolve, reject) => {
      resolveCount = resolve;
      rejectCount = reject;
    });

    //Create a promise and callbacks for the full set of data
    let resolveData!: (data: TEntity[]) => void;
    let rejectData!: (err: Error) => void;
    const dataPromise = new Promise<TEntity[]>((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });

    //Keep track of entities received as we get them
    const entities: TEntity[] = [];
    const queue = new AsyncQueue<TEntity>();

    //We need the $select/$expand for the user's validation, if provided
    const selectExpand = selectExpandToObject(options);

    const parser = new JSONParser();
    
    //Configures the parser to handle JSON in chunks, if applicable
    parser.onValue = ({ value, key, parent, stack }) => {
      //$it/@odata.count
      if (stack && stack.length === 1 && key === "@odata.count") {
        resolveCount(value as number);
      }

      //$it/value
      if (stack && stack.length === 2 && stack[1].key === "value") {
        if (this.options.validator) {
          //The user provided a validator, so ensure the entity is valid
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

    //On a failure, we need to reject the promises
    const onError = (err: Error): void => {
      rejectCount(err);
      rejectData(err);
      queue.fail(err);
    };

    parser.onError = onError;

    //On completion, we need to resolve all the data
    const onEnd = (): void => {
      resolveData(entities);
      rejectCount(new Error("Count was not received from the server"));
      queue.complete();
    }

    parser.onEnd = onEnd;

    //Call an IIFE to act as our worker loop
    (async () => {
      try {
        //Invoke the HTTP request
        const response = await result;

        if (response.data instanceof Promise) {
          //We are receiving back the full, raw data
          const data = await response.data as SafeAny;
          if ("@odata.count" in data) {
            resolveCount(data["@odata.count"]);
          }
          for (const value of data["value"]) {
            //The user provided a validator, so ensure the entity is valid
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
          //We are receiving the data in string chunks
          for await (const chunk of response.data) {
            //Parser seems to encounter issues if we add whitespace after we finish
            if (/\S/.test(chunk)) {
              parser.write(chunk.trim());
            }
          }
        }
        onEnd();
      } catch (err) {
        onError(err as Error);
      }
    })();

    return {
      count: countPromise,
      data: dataPromise,
      iterator: queue,
      result: countPromise.then(
        () => true,
        () => false,
      ),
    }
  }
}
