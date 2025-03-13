export function padLeft(
  input: string,
  length: number,
  fill: string,
) {
  if (fill.length !== 1)
    throw new Error("Fill character must have length 1");

  while (input.length < length) {
    input = fill + input;
  }

  return input;
}
