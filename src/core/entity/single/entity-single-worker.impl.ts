import { JSONParser } from "@streamparser/json";
import { HttpMethod } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { ODataClientOptions } from "../../client/odata-client";
import { DefaultHttpClientAdapter } from "../../http/http-client-adapter";
import { selectExpandToObject } from "../../parameters/expand";
import { getParams, ODataOptions } from "../../parameters/odata-options";
import { EntityResponse } from "../../response/entity-response";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySingleWorker } from "./entity-single-worker";

export interface EntitySingleWorkerImplOptions<TEntity> {
  rootOptions: ODataClientOptions;
  method: HttpMethod;
  url: string;
  payload?: Partial<TEntity>;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error;
}

/**
 * A physical entity single worker.
 */
export class EntitySingleWorkerImpl<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly options: EntitySingleWorkerImplOptions<TEntity>;

  constructor(
    options: EntitySingleWorkerImplOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    //Converts the options into query parameters.
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

    //Create a promise and callbacks for the data
    let resolveData!: (data: TEntity) => void;
    let rejectData!: (err: Error) => void;
    const dataPromise = new Promise<TEntity>((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });

    //Keep track of the returned entity
    let entity!: TEntity;

    //We need the $select/$expand for the user's validation, if provided
    const selectExpand = selectExpandToObject(options);

    const parser = new JSONParser();
    
    //Configures the parser to handle JSON in chunks, if applicable
    parser.onValue = ({ value, key, parent, stack }) => {
      if (stack && stack.length === 0) {
        if (this.options.validator) {
          //The user provided a validator, so ensure the entity is valid
          const parseResult = this.options.validator(value, selectExpand);
          if (parseResult instanceof Error)
            throw parseResult;

          entity = parseResult;
        } else {
          entity = value as TEntity;
        }
      }
    };

    //On a failure, we need to reject the promises
    const onError = (err: Error): void => {
      rejectData(err);
    };

    parser.onError = onError;

    const onEnd = (): void => {}

    parser.onEnd = onEnd;

    //Call an IIFE to act as our worker loop
    (async () => {
      try {
        //Invoke the HTTP request
        const response = await result;

        if (response.data instanceof Promise) {
          //We are receiving back the full, raw data
          const value = await response.data as SafeAny;
          if (this.options.validator) {
            //The user provided a validator, so ensure the entity is valid
            const parseResult = this.options.validator(value, selectExpand);
            if (parseResult instanceof Error)
              throw parseResult;

            entity = parseResult;
          } else {
            entity = value;
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

        resolveData(entity);
      } catch (err) {
        onError(err as Error);
      }
    })();

    return {
      data: dataPromise,
      result: dataPromise.then(
        () => true,
        () => false,
      ),
    };
  }
}
