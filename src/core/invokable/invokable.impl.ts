import { extendUrl, HttpMethod } from "../../utils/http";
import { SafeAny } from "../../utils/types";
import { Value } from "../../values/base";
import { ODataClientOptions } from "../client/odata-client";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerImpl } from "../entity/set/entity-set-worker.impl";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerImpl } from "../entity/single/entity-single-worker.impl";
import { ParameterValue } from "../invokable/builder/invokable-builder";
import { EntityInvokable, Invokable } from "./invokable";

export interface InvokableImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
  method: HttpMethod;
  isBody: boolean;
  values?: ParameterValue<SafeAny>;
  converter?: (value: SafeAny) => SafeAny;
  isCollection: boolean;
}

/**
 * A physical invokable.
 */
export abstract class InvokableImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements Invokable<TParameter, TCollection, TReturn> {

  protected readonly options;

  constructor(
    options: InvokableImplOptions,
  ) {
    this.options = options;
  }

  /**
   * Creates the body to send to the invokable.
   * @param parameters The user-provided invokable parameters.
   * @returns The body to send.
   */
  private getBody(parameters: TParameter) {
    if (!this.options.isBody)
      return undefined;

    if (this.options.converter)
      return this.options.converter(parameters);

    return parameters;
  }

  /**
   * Creates the query string to send to the invokable.
   * @param parameters The user-provided invokable parameters.
   * @returns The query string to send.
   */
  private getQuery(parameters: TParameter) {
    if (this.options.isBody)
      return undefined;

    const valuesMap = this.options.values;
    if (!valuesMap)
      throw new Error("Must specify a value converter when calling .withParameters");

    const keys = Object.keys(parameters);
    const values = keys
      .map(key => ({ key: key, value: <Value<SafeAny>>(valuesMap as SafeAny)[key](parameters[key as keyof typeof parameters]) }))
      .map(data => `${data.key}=${encodeURIComponent(data.value.toString())}`)
      .join("&");
    
    return values;
  }

  /**
   * Creates a worker for a collection response.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }

  /**
   * Creates a worker for a single response.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSingleWorker(parameters: TParameter): EntitySingleWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySingleWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }
  
  invoke(parameters: TParameter): TCollection extends true ? EntitySet<TReturn> : EntitySingle<TReturn> {
    if (this.options.isCollection) {
      const worker = this.createSetWorker(parameters);
      return new EntitySetImpl(worker) as SafeAny;
    } else {
      const worker = this.createSingleWorker(parameters);
      return new EntitySingleImpl(worker) as SafeAny;
    }
  }
}

export interface EntityInvokableImplOptions extends InvokableImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

/**
 * A physical invokable, targeting an entity.
 */
export abstract class EntityInvokableImpl<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityInvokable<TKey, TParameter, TCollection, TReturn> {

  protected readonly options;

  constructor(
    options: EntityInvokableImplOptions,
  ) {
    this.options = options;
  }

  /**
   * Creates the body to send to the invokable.
   * @param parameters The user-provided invokable parameters.
   * @returns The body to send.
   */
  private getBody(parameters: TParameter) {
    if (!this.options.isBody)
      return undefined;

    if (this.options.converter)
      return this.options.converter(parameters);

    return parameters;
  }

  /**
   * Creates the query string to send to the invokable.
   * @param parameters The user-provided invokable parameters.
   * @returns The query string to send.
   */
  private getQuery(parameters: TParameter) {
    if (this.options.isBody)
      return undefined;

    const valuesMap = this.options.values;
    if (!valuesMap)
      throw new Error("Must specify a value converter when calling .withParameters");

    const keys = Object.keys(parameters);
    const values = keys
      .map(key => ({ key: key, value: <Value<SafeAny>>(valuesMap as SafeAny)[key](parameters[key as keyof typeof parameters]) }))
      .map(data => `${data.key}=${encodeURIComponent(data.value.toString())}`)
      .join("&");
    
    return values;
  }

  /**
   * Creates a worker for a collection response.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSetWorker(key: TKey, parameters: TParameter): EntitySetWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const entityUrl = this.options.entitySet.buildUrl(key);
    const url = extendUrl(entityUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }

  /**
   * Creates a worker for a single response.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSingleWorker(key: TKey, parameters: TParameter): EntitySingleWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const entityUrl = this.options.entitySet.buildUrl(key);
    const url = extendUrl(entityUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySingleWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }
  
  invoke(key: TKey, parameters: TParameter): TCollection extends true ? EntitySet<TReturn> : EntitySingle<TReturn> {
    if (this.options.isCollection) {
      const worker = this.createSetWorker(key, parameters);
      return new EntitySetImpl(worker) as SafeAny;
    } else {
      const worker = this.createSingleWorker(key, parameters);
      return new EntitySingleImpl(worker) as SafeAny;
    }
  }
}
