
import fs from 'fs';
import { Queue } from 'datastructures-js';

const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function eq(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n')
      .map(line => Array.from(line));

  const goalSteps = process.argv[3] ? Number(process.argv[3]) : 26501365;

  const gridSize = grid.length;

  const table = [];
  for (let i = 4; i < 8; ++i) {
    const chosenGoal = goalSteps % gridSize + i * gridSize;
    const steps = floodfill(grid, chosenGoal);
    table.push([i, steps]);
  }
  // Use wolfram alpha to quadratic fit these points
  console.log(table.map(([x,y]) => `(${x},${y})`).join(','));
  // Then evaluate for x = this number
  console.log(Math.floor(goalSteps / gridSize));
}

function floodfill(grid, goalSteps) {
  // Wrap around
  const width = grid[0].length;
  const height = grid.length;
  function gridGet([x, y]) {
    if (x < 0) x += width * Math.ceil(-x / width);
    if (y < 0) y += height * Math.ceil(-y / height);
    return grid[y % height][x % width];
  }

  const startY = grid.findIndex(row => row.includes('S'));
  const startX = grid[startY].findIndex(col => col === 'S');
  const start = [startX, startY];

  let visited = [];
  let visitedSet = new Set;

  let queue = new Queue([[start, 0]]);
  let result = 0;
  let counter = 0;

  while (!queue.isEmpty()) {

    const [ position, depth ] = queue.dequeue();

    const cacheKey = position.toString();

    if (++counter % 1e7 === 0) console.log({ counter, depth, queueSize: queue.size() });
    //console.log({ depth, visitedDepth: visited[cacheKey], position });

    // Visited check
    if (visitedSet.has(cacheKey)) continue;
    visitedSet.add(cacheKey);
    visited.push(cacheKey);

    // Assume we can drop the back half of the cache
    const maxSize = 1e5;
    if (visited.length > maxSize) {
      //console.log('Dumping cache...');
      visited = visited.slice(maxSize / 2);
      visitedSet = new Set(visited);
    }

    //console.log({ goalSteps, depth });

    // Depth checks
    if ((goalSteps - depth) % 2 === 0) result++;
    if (depth >= goalSteps) continue;


    for (let direction of directions) {

      const newPosition = add(direction, position);
      //console.log({position, direction, newPosition});

      // Terrain check
      if (gridGet(newPosition) === '#') continue;

      queue.enqueue([newPosition, depth + 1]);
    }
  }

  return result;
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
