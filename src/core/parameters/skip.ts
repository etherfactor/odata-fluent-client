export type Skip = number;

export function skipToString(skip: Skip): string {
  const useValue = skip.toFixed(0);
  return useValue;
}
