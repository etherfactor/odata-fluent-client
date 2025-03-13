import { HttpClient } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable, map } from "rxjs";
import { z } from "zod";
import { InferArrayType } from "../../utils/type-inference";
import { EntityExpand, EntitySingle, Expand, ODataOptions, Select, expandToString, selectToString } from "../odata.util";
import { ɵEntityExpand } from "./expand";

abstract class Base<TEntity> implements EntitySingle<TEntity> {

  private readonly worker: EntitySingleWorker<TEntity>;
  private readonly expandValue?: Expand[];
  private readonly selectValue?: Select[];

  constructor(worker: EntitySingleWorker<TEntity>, options?: ODataOptions) {
    this.worker = worker;
    this.expandValue = options?.expand;
    this.selectValue = options?.select;
  }

  protected abstract new<TNewEntity = TEntity>(worker: EntitySingleWorker<TNewEntity>, options?: ODataOptions): Base<TNewEntity>;

  expand<TExpanded extends keyof TEntity & string>(property: TExpanded, builder?: (expand: EntityExpand<InferArrayType<TEntity[TExpanded]>>) => EntityExpand<InferArrayType<TEntity[TExpanded]>>): EntitySingle<TEntity> {
    let expander: EntityExpand<InferArrayType<TEntity[TExpanded]>> = new ɵEntityExpand.Implementation<InferArrayType<TEntity[TExpanded]>>(property);
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

  execute(): Observable<TEntity> {
    return this.worker.execute(this.getOptions());
  }
}

class Implementation<TEntity> extends Base<TEntity> {

  private readonly $http: HttpClient;
  private readonly method: "GET" | "POST" | "PATCH";
  private readonly url: string;
  private readonly data: Partial<TEntity> | undefined;
  private readonly schema: z.ZodSchema<TEntity>;

  constructor(
    $http: HttpClient,
    method: "GET" | "POST" | "PATCH",
    url: string,
    data: Partial<TEntity> | undefined,
    schema: z.ZodSchema<TEntity>,
    options?: ODataOptions,
  ) {
    super(new ConcreteEntitySingleWorker($http, method, url, data, schema), options);
    this.$http = $http;
    this.method = method;
    this.url = url;
    this.data = data;
    this.schema = schema;
  }

  protected override new<TNewEntity = TEntity>(worker: EntitySingleWorker<TNewEntity>, options?: ODataOptions | undefined): Base<TNewEntity> {
    return new Implementation(this.$http, this.method, this.url, this.data as TNewEntity, this.schema as any, options);
  }
}

abstract class EntitySingleWorker<TEntity> {
  abstract execute(options: ODataOptions): Observable<TEntity>;
}

class ConcreteEntitySingleWorker<TEntity> extends EntitySingleWorker<TEntity> {

  private readonly $http: HttpClient;
  private readonly method: "GET" | "POST" | "PATCH";
  private readonly url: string;
  private readonly data: Partial<TEntity> | undefined;
  private readonly schema: z.ZodSchema<TEntity>;

  constructor(
    $http: HttpClient,
    method: "GET" | "POST" | "PATCH",
    url: string,
    data: Partial<TEntity> | undefined,
    schema: z.ZodSchema<TEntity>,
  ) {
    super();
    this.$http = $http;
    this.method = method;
    this.url = url;
    this.data = data;
    this.schema = schema;
  }

  override execute(options: ODataOptions): Observable<TEntity> {
    const params = this.getParams(options);

    switch (this.method) {
      case ("GET"):
        return this.$http.get(this.url, {
          params: params
        }).pipe(
          map((data) => {
            const schema = this.schema;
            return schema.parse(data) as TEntity;
          }),
        );

      case ("POST"):
        return this.$http.post(this.url, this.data, {
          params: params
        }).pipe(
          map((data) => {
            const schema = this.schema;
            return schema.parse(data) as TEntity;
          }),
        );

      case ("PATCH"):
        return this.$http.patch(this.url, this.data, {
          params: params
        }).pipe(
          map((data) => {
            const schema = this.schema;
            return schema.parse(data) as TEntity;
          })
        );

      default:
        throw new Error(`Invalid method ${this.method}`);
    }
  }

  getParams(options: ODataOptions): Params {
    const params: Params = {};

    if (options.expand) {
      params['$expand'] = expandToString(options.expand);
    }

    if (options.select) {
      params['$select'] = selectToString(options.select);
    }

    return params;
  }
}

export const ɵEntitySingle = {
  Implementation,
  //MockImplementation,
};
