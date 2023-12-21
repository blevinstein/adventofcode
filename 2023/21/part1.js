
import fs from 'fs';

const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n')
      .map(line => Array.from(line));

  const startY = grid.findIndex(row => row.includes('S'));
  const startX = grid[startY].findIndex(col => col === 'S');
  const start = [startX, startY];

  // Floodfill
  let visited = new Set;
  let queue = [[start, 0]];
  let result = [];
  while (queue.length > 0) {
    const [ position, depth ] = queue.shift(); // Shift to BFS, Pop to DFS

    // Visited check
    const cacheKey = [ position, depth ].toString();
    if (visited.has(cacheKey)) continue;
    visited.add(cacheKey);

    // Depth check
    //if (depth == 6) {
    if (depth == 64) {
      result.push(position);
      continue;
    }

    for (let direction of directions) {
      const newPosition = add(direction, position);
      //console.log({position, direction, newPosition});

      // Bounds check
      if (newPosition[0] < 0 || newPosition[0] >= grid[0].length
          || newPosition[1] < 0 || newPosition[1] >= grid.length) continue;

      // Terrain check
      if (grid[newPosition[1]][newPosition[0]] === '#') continue;

      queue.push([newPosition, depth + 1]);
    }
  }

  console.log(result.length);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
