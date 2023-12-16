
import fs from 'fs';

const directionVector = [
  [1, 0],  // 0 right
  [0, 1],  // 1 down
  [-1, 0], // 2 left
  [0, -1], // 3 up
];

const transform = {
  '/': {
    0: [3],
    3: [0],
    1: [2],
    2: [1],
  },
  '\\': {
    0: [1],
    1: [0],
    2: [3],
    3: [2],
  },
  '|': {
    0: [1, 3],
    2: [1, 3],
    1: [1],
    3: [3],
  },
  '-': {
    0: [0],
    2: [2],
    1: [0, 2],
    3: [0, 2],
  },
};

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n')
      .map(line => Array.from(line));

  const allInitialStates = [].concat(
      range(grid.length).map(y => [[-1, y], 0]),
      range(grid.length).map(y => [[grid[0].length, y], 2]),
      range(grid[0].length).map(x => [[x, -1], 1]),
      range(grid[0].length).map(x => [[x, grid.length], 3]));

  let best = undefined;
  for (let initialState of allInitialStates) {
    const value = floodfill(grid, initialState);
    if (!best || value > best[0]) {
      best = [value, initialState];
      console.log(best);
    }
  }
  console.log('Done!');
}

function floodfill(grid, initialState) {
  // Floodfill
  // state = [[x, y], direction];
  const states = [initialState];
  const energized = new Set;
  const visited = new Set;

  while (states.length > 0) {
    const state = states.pop();
    const [ location, direction ] = state;
    const newLocation = add(location, directionVector[direction]);

    if (visited.has(state.toString())) continue;
    visited.add(state.toString());

    // Off the grid
    if (newLocation[0] < 0 || newLocation[0] >= grid[0].length
        || newLocation[1] < 0 || newLocation[1] >= grid.length) continue;
    //console.log({location, direction, newLocation})
    energized.add(newLocation.toString());

    const tile = grid[newLocation[1]][newLocation[0]];
    if (tile in transform) {
      for (let newDirection of transform[tile][direction]) {
        states.push([newLocation, newDirection]);
      }
    } else {
      states.push([newLocation, direction]);
    }
  }

  /*
  for (let y = 0; y < grid.length; ++y) {
    for (let x = 0; x < grid[0].length; ++x) {
      process.stdout.write(grid[y][x] + (energized.has([x, y].toString()) ? '#' : ' '));
    }
    process.stdout.write('\n');
  }
  */

  return energized.size;
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
