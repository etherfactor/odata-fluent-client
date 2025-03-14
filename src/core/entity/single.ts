import { HttpMethod } from "../../utils/http";
import { InferArrayType } from "../../utils/types";
import { HttpClientAdapter, HttpModelValidator } from "../client";
import { Expand, expandToString, ODataOptions, QueryParams, Select, selectToString } from "../params";
import { EntityExpand, EntityExpandImpl } from "./expand";
import { EntityResponse } from "./response";

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

    const response = this.options.adapter.invoke({
      method: this.options.method,
      url: this.options.url,
      headers: {},
      query: params,
    });

    let resolveData!: (data: TEntity) => void;
    let rejectData!: (err: Error) => void;
    const dataPromise = new Promise<TEntity>((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });

    (async () => {
      const result = await response;
      const data = await result.data;
      if (this.options.validator) {
        const parseResult = this.options.validator.validate(data);
        if (!parseResult)
          throw new Error("Model failed to validate; to get more detail, throw an exception from the validator");
      }

      resolveData(data as TEntity);
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
