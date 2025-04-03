export type Select = string;

export function selectToString(select: Select[]): string {
  const useValue = select.join(', ');
  return useValue;
}
