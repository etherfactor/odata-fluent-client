export interface EntityNavigation<TNavigation extends {}> {
  _: TNavigation;
}

export interface NavigationType<TNewEntity> {
  add(entity: TNewEntity): void;
  remove(entity: TNewEntity): void;
  set(entity: TNewEntity): void;
  unset(entity: TNewEntity): void;
}
