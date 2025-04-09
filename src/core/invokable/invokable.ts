export interface InvokableFull<
  TParameter extends {},
  TReturn,
> {
  invoke(parameters: TParameter): Promise<TReturn>;
}

export type Invokable<
  TParameter extends {},
  TReturn,
> =
  InvokableFull<TParameter, TReturn>;

export interface EntityInvokableFull<
  TKey,
  TParameter extends {},
  TReturn,
> {
  invoke(key: TKey, parameters: TParameter): Promise<TReturn>;
}

export type EntityInvokable<
  TKey,
  TParameter extends {},
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TReturn>;
