
import fs from 'fs';

function height(grid, position) {
  return heightOf(grid[position.y][position.x]);
}

function heightOf(char) {
  if (char == 'S') {
    return heightOf('a');
  } else if (char == 'E') {
    return heightOf('z');
  } else {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
  }
}

const steps = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function eq(a, b) {
  return a.x == b.x && a.y == b.y;
}

function str(pos) {
  return `${pos.x},${pos.y}`;
}

function neighbors(grid, position) {
  const currentHeight = height(grid, position);
  let neighbors = [];
  for (let step of steps) {
    const newPosition = add(position, step);
    if (newPosition.x < 0 || newPosition.x >= grid[0].length ||
        newPosition.y < 0 || newPosition.y >= grid.length) {
      continue;
    }
    const newHeight = height(grid, newPosition);
    if (newHeight <= currentHeight + 1) {
      neighbors.push(newPosition);
    }
  }
  return neighbors;
}

function bfs(grid, start, end) {
  const visited = new Set();
  const queue = [[start, 0, [start]]];
  while (queue.length > 0) {
    const [position, steps] = queue.shift();
    if (visited.has(str(position))) {
      continue;
    } else {
      visited.add(str(position));
    }
    for (let nextPosition of neighbors(grid, position)) {
      if (eq(nextPosition, end)) {
        return steps + 1;
      } else {
        queue.push([nextPosition, steps + 1]);
      }
    }
  }
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const grid = rawInput.split('\n');

  // Find end position
  let start = [];
  let end = null;
  for (let y = 0; y < grid.length; ++y) {
    for (let x = 0; x < grid[y].length; ++x) {
      if (grid[y][x] == 'E') {
        end = {x, y};
      } else if (grid[y][x] == 'S' || grid[y][x] == 'a') {
        start.push({x, y});
      }
    }
  }
  console.log({start, end});

  let steps = start.map(s => bfs(grid, s, end)).filter(i => i);
  steps.sort((a, b) => a - b);
  console.log(steps);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
