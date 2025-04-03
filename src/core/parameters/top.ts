export type Top = number;

export function topToString(top: Top): string {
  const useValue = top.toFixed(0);
  return useValue;
}
