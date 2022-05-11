export function getMaxAndMin(arr: number[]) {
  const min = Math.min.apply(Math, arr);
  const max = Math.max.apply(Math, arr);

  return [min, max];
}

export function getMidCoordinate(x1: number, x2: number) {
  return Math.floor(x2 - x1) / 2 + x1;
}
