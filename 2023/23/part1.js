
import fs from 'fs';

export function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export const unit4 = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

export const neighbors = {
  '>': [[1, 0]],
  '^': [[0, -1]],
  'v': [[0, 1]],
  '<': [[-1, 0]],
  '.': unit4,
};

export function eq(a, b) {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      Array.from(line));
  const width = grid[0].length;
  const height = grid.length;
  const startY = 0;
  const startX = grid[startY].findIndex(col => col === '.');
  const start = [startX, startY];

  const queue = [[start]];
  let best;
  while (queue.length > 0) {
    const path = queue.shift();

    if (!best || path.length > best.length) {
      best = path;
    }

    const position = path[path.length - 1];
    const currentTerrain = grid[position[1]][position[0]];
    for (let unit of neighbors[currentTerrain]) {
      const newPosition = add2(position, unit);

      if (newPosition[0] < 0 || newPosition[0] >= width
          || newPosition[1] < 0 || newPosition[1] >= height) continue;
      if (path.some(p => eq(p, newPosition))) continue;

      const newTerrain = grid[newPosition[1]][newPosition[0]];
      if (newTerrain === '#') continue;
      queue.push(path.concat([newPosition]));
    }
  }
  console.log({ length: best.length - 1 });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
