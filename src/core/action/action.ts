export interface ActionFull<
  TParameter extends {},
  TReturn,
> {
  invoke(parameters: TParameter): Promise<TReturn>;
}

export type Action<
  TParameter extends {},
  TReturn,
> =
  ActionFull<TParameter, TReturn>;

export interface EntityActionFull<
  TKey,
  TParameter extends {},
  TReturn,
> {
  invoke(key: TKey, parameters: TParameter): Promise<TReturn>;
}

export type EntityAction<
  TKey,
  TParameter extends {},
  TReturn,
> =
  EntityActionFull<TKey, TParameter, TReturn>;
