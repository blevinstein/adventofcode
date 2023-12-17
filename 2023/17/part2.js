
import fs from 'fs';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

function dist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function eq(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

const directionVector = [
  [1, 0],  // 0 right
  [0, 1],  // 1 down
  [-1, 0], // 2 left
  [0, -1], // 3 up
];

const directionCharacter = [ '>', 'v', '<', '^' ];

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      Array.from(line).map(c => Number(c)));

  let result;
  const start = [0, 0];
  const destination = [grid[0].length - 1, grid.length - 1];
  const minCost = {};
  const queue = new MinPriorityQueue(({ position, direction, cost }) => cost + dist(position, destination));
  queue.enqueue({ position: start, cost: 0, directions: range(10).map(_ => -1) });
  let counter = 0;
  while (queue.size() > 0) {
    const { position, cost, directions } = queue.dequeue();

    if (++counter % 100000 === 0) {
    //if (++counter % 100 === 0) {
      // DEBUG
      const minCost = cost + dist(position, destination);
      console.log({ position, cost, minCost, queueSize: queue.size() });
    }

    if (eq(position, destination)
        && directions.slice(directions.length - 4)
            .every(d => d === directions[directions.length - 1])) {
      result = { cost, directions };
      break;
    }

    const cacheKey = position.concat(directions.slice(directions.length - 10)).toString();
    if (minCost[cacheKey] <= cost) continue;
    minCost[cacheKey] = cost;

    for (let direction of range(4)) {
      const lastDifferentMove =
          directions.findLastIndex(d => d !== directions[directions.length - 1]);
      const matchingMoves = directions.length - 1 - lastDifferentMove;

      // Must move 4 squares in a direction
      if (directions[directions.length - 1] >= 0
          && matchingMoves < 4
          && direction !== directions[directions.length - 1]) continue;

      // Cannot move 10 squares in the same direction
      if (directions.slice(directions.length - 10).every(d => d === direction)) continue;

      // Cannot reverse
      if (directions[directions.length - 1] === (direction + 2) % 4) continue;

      const newPosition = add(directionVector[direction], position);
      // Cannot leave the grid
      if (newPosition[0] < 0 || newPosition[0] >= grid[0].length
          || newPosition[1] < 0 || newPosition[1] >= grid.length) continue;

      const newCost = cost + grid[newPosition[1]][newPosition[0]];
      queue.enqueue({
        position: newPosition,
        cost: newCost,
        directions: directions.slice(directions.length - 10).concat(direction)
        //directions: directions.concat(direction)
      });
    }
  }

  /*
  let trace = start;
  const path = {};
  for (let direction of result.directions) {
    if (direction === -1) continue;
    trace = add(trace, directionVector[direction]);
    path[trace.toString()] = directionCharacter[direction];
  }
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid[0].length; ++j) {
      process.stdout.write(grid[i][j].toString());
      process.stdout.write(path[[j, i].toString()] || ' ');
    }
    process.stdout.write('\n');
  }
  */

  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
