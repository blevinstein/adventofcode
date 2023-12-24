

// TODOs:
// - Add graph search helper methods? DFS, BFS, A*

export function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

export function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function mul2(a, b) {
  if (typeof b === 'number' || typeof b === 'bigint') {
    return [a[0] * b, a[1] * b];
  } else {
    return [a[0] * b[0], a[1] * b[1]];
  }
}

export function mul3(a, b) {
  if (typeof b === 'number' || typeof b === 'bigint') {
    return [a[0] * b, a[1] * b, a[2] * b];
  } else {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
  }
}

export function eq(a, b) {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

export function dot(a, b) {
  if (a.length !== b.length) throw Error('Dimension mismatch');
  return a.map((el, i) => el * b[i]).reduce((a, b) => a + b);
}

export function manhattanDist(a, b) {
  return a.map((el, i) => Math.abs(el - b[i])).reduce((a, b) => a + b);
}

export function magnitude(v) {
  return v.map(el => el * el).reduce((a, b) => a + b);
}

export function cross(a, b) {
  if (a.length !== 3 || b.length !== 3) throw Error(`Bad input: ${a} cross ${b}`);

  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
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
