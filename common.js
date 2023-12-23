

// TODOs:
// - Add graph search helper methods? DFS, BFS, A*

export function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub2(a, b) {
  return add2(a, mul2(b, -1));
}

export function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub3(a, b) {
  return add2(a, mul3(b, -1));
}

export function mul2(a, b) {
  if (typeof b === 'number') {
    return [a[0] * b, a[1] * b];
  } else {
    return [a[0] * b[0], a[1] * b[1]];
  }
}

export function mul3(a, b) {
  if (typeof b === 'number') {
    return [a[0] * b, a[1] * b, a[2] * b];
  } else {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
  }
}

export function eq(a, b) {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

export function manhattanDist(a, b) {
  return a.map((el, i) => Math.abs(el - b[i])).reduce((a, b) => a + b);
}

export const unit4 = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

export const unit8 = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

export function range(...args) {
  let [start, endExclusive] = args.length === 1 ? [0, args[0]] : args;
  return Array.from(function*(start, endExclusive) {
    for (let i = start; i < endExclusive; ++i) yield i;
  }(start, endExclusive));
}

export function range2(width, height) {
  return range(width).flatMap(x => range(height).map(y => [x, y]));
}
