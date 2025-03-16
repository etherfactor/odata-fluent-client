import { JSONParser } from "@streamparser/json";
import { HttpMethod } from "../../utils/http";
import { InferArrayType, SafeAny } from "../../utils/types";
import { HttpClientAdapter } from "../http-client-adapter";
import { HttpModelValidator } from "../http-model-validator";
import { Expand, expandToString, ODataOptions, QueryParams, Select, selectToString } from "../params";
import { EntityExpand, EntityExpandImpl } from "./entity-expand";
import { EntityResponse } from "./entity-response";

export interface EntitySingle<TEntity> {
  execute(): EntityResponse<TEntity>;
  expand<TExpanded extends keyof TEntity & string>(
    property: TExpanded /*& (TEntity[TExpanded] extends Array<any> | object ? TExpanded : never)*/,
    builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntitySingle<TEntity>;
  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>>;
}

export class EntitySingleImpl<TEntity> implements EntitySingle<TEntity> {

  protected readonly worker: EntitySingleWorker<TEntity>;
  private readonly expandValue?: Expand[];
  private readonly selectValue?: Select[];

  constructor(
    worker: EntitySingleWorker<TEntity>,
    options?: ODataOptions,
  ) {
    this.worker = worker;
    this.expandValue = options?.expand;
    this.selectValue = options?.select;
  }

  protected new<TNewEntity = TEntity>(worker: EntitySingleWorker<TNewEntity>, options?: ODataOptions): EntitySingleImpl<TNewEntity> {
    return new EntitySingleImpl(this.worker as unknown as EntitySingleWorkerImpl<TNewEntity>, options);
  }

  expand<TExpanded extends keyof TEntity & string>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntitySingle<TEntity> {
    let expander: EntityExpand<InferArrayType<TEntity[TExpanded]>> = new EntityExpandImpl<InferArrayType<TEntity[TExpanded]>>(property);
    if (builder) {
      expander = builder(expander);
    }

    const expand: Expand = { property, value: expander };
    const newExpand = [...(this.expandValue ?? []), expand];

    const options = this.getOptions();
    options.expand = newExpand;

    return this.new<TEntity>(this.worker, options);
  }

  select<TSelected extends keyof TEntity & string>(...properties: TSelected[]): EntitySingle<Pick<TEntity, TSelected>> {
    const options = this.getOptions();
    options.select ??= [];
    options.select = [...options.select, ...properties];

    return this.new<Pick<TEntity, TSelected>>(this.worker, options);
  }

  private getOptions(): ODataOptions {
    return {
      expand: this.expandValue,
      select: this.selectValue,
    };
  }

  execute(): EntityResponse<TEntity> {
    return this.worker.execute(this.getOptions());
  }
}

export interface EntitySingleWorker<TEntity> {
  execute(options: ODataOptions): EntityResponse<TEntity>;
}

export interface EntitySingleWorkerImplOptions<TEntity> {
  adapter: HttpClientAdapter;
  method: HttpMethod;
  url: string;
  payload?: Partial<TEntity>;
  validator?: HttpModelValidator<TEntity>;
}

export class EntitySingleWorkerImpl<TEntity> implements EntitySingleWorker<TEntity> {

  private readonly options: EntitySingleWorkerImplOptions<TEntity>;

  constructor(
    options: EntitySingleWorkerImplOptions<TEntity>,
  ) {
    this.options = options;
  }

  execute(options: ODataOptions): EntityResponse<TEntity> {
    const params = this.getParams(options);

    const result = this.options.adapter.invoke({
      method: this.options.method,
      url: this.options.url,
      headers: {},
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

    const parser = new JSONParser();
    
    parser.onValue = ({ value, key, parent, stack }) => {
      if (stack && stack.length === 0) {
        if (this.options.validator) {
          const parseResult = this.options.validator.validate(value);
          if (!parseResult)
            throw new Error("Model failed to validate; to get more detail, throw an exception from the validator");
        }

        console.log("received entity", value);

        entity = value as TEntity;
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
            const parseResult = this.options.validator.validate(value);
            if (!parseResult)
              throw new Error("Model failed to validate; to get more detail, throw an exception from the validator");
          }

          entity = value;
        } else {
          for await (const chunk of response.data) {
            if (/\S/.test(chunk)) {
              console.log("chunk: >>", chunk, "<<");
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

  getParams(options: ODataOptions): QueryParams {
    const params: QueryParams = {};

    if (options.expand) {
      params['$expand'] = expandToString(options.expand);
    }

    if (options.select) {
      params['$select'] = selectToString(options.select);
    }

    return params;
  }
}
