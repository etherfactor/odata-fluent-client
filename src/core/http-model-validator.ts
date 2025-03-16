export interface HttpModelValidator<TEntity> {
  validate(data: unknown): data is TEntity;
}
  