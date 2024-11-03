export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error('No values provided');
  }

  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);

  // we know that the indexes are valid here because we checked the length above
  // and the midpoint is computed from the array length
  return values.length % 2 !== 0
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      values[mid]!
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (values[mid - 1]! + values[mid]!) / 2;
}
