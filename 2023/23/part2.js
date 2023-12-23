
import fs from 'fs';
import { add2, unit4, eq } from '../../common.js';

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      Array.from(line));
  const width = grid[0].length;
  const height = grid.length;
  const startY = 0;
  const startX = grid[startY].findIndex(col => col === '.');
  const start = [startX, startY];
  const goalY = grid.length - 1;

  function encode(position) {
    return position[0] + position[1] * width;
  }

  function decode(number) {
    return [number % width, Math.floor(number / width)];
  }

  const neighbors = {};
  for (let r = 0; r < height; ++r) {
    for (let c = 0; c < width; ++c) {
      if (grid[r][c] === '#') continue;
      const position = [c, r];
      neighbors[position.toString()] = [];
      for (let unit of unit4) {
        const newPosition = add2(position, unit);
        // Bounds check
        if (newPosition[0] < 0 || newPosition[0] >= width
            || newPosition[1] < 0 || newPosition[1] >= height) continue;
        // Terrain check
        if (grid[newPosition[1]][newPosition[0]] === '#') continue;
        neighbors[position.toString()].push(newPosition);
      }
    }
  }

  // Compute neighborPaths from neighbors
  const neighborPaths = {};
  for (let r = 0; r < height; ++r) {
    for (let c = 0; c < width; ++c) {
      if (grid[r][c] === '#') continue;
      const position = [c, r];
      if (neighbors[position.toString()].length === 2) continue;
      neighborPaths[position.toString()] = [];
      for (let neighbor of neighbors[position.toString()]) {
        const path = [neighbor];
        while (neighbors[path[path.length - 1].toString()].length === 2) {
          path.push(neighbors[path[path.length - 1].toString()]
              .find(p => !eq(p, path[path.length - 2] || position)));
        }
        neighborPaths[position.toString()].push(path);
      }
    }
  }

  //Object.entries(neighborPaths).forEach(([c, paths]) => console.log(`${c} => ${paths.map(p => JSON.stringify(p)).join('\n\t')}`));
  Object.entries(neighborPaths).forEach(([c, paths]) => console.log(`${c} => ${paths.map(p => p.length).toString()}`));
  console.log(`${Object.keys(neighborPaths).length} nodes`);

  const queue = [[encode(start)]];
  let best;
  let counter = 0;
  while (queue.length > 0) {
    const path = queue.pop();
    const positionEncoded = path[path.length - 1];
    const position = decode(path[path.length - 1]);

    if (++counter % 1e5 === 0) console.log({ counter, queueSize: queue.length, pathLength: path.length });

    if (position[position.length - 1] === goalY && (!best || path.length > best.length)) {
      best = path;
      console.log({ best: best.length });
    }

    /*
    for (let newPosition of neighbors[position.toString()]) {
      if (path.includes(encode(newPosition))) continue;
      queue.push(path.concat([encode(newPosition)]));
    }
    */
    for (let newPath of neighborPaths[position.toString()]) {
      if (path.includes(encode(newPath[newPath.length - 1]))) continue;
      queue.push(path.concat(newPath.map(encode)));
    }
  }

  for (let r = 0; r < height; ++r) {
    for (let c = 0; c < width; ++c) {
      if (best.includes(encode([c, r]))) {
        process.stdout.write('O');
      } else {
        process.stdout.write(grid[r][c]);
      }
      process.stdout.write(grid[r][c]);
    }
    process.stdout.write('\n');
  }

  console.log({ length: best.length - 1 });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
