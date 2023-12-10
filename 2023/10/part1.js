
import fs from 'fs';

const adjacency = {
  '|': [[-1, 0], [1, 0]],
  '-': [[0, -1], [0, 1]],
  L: [[-1, 0], [0, 1]],
  J: [[-1, 0], [0, -1]],
  '7': [[1, 0], [0, -1]],
  'F': [[1, 0], [0, 1]],
  '.': [],
};

function eq(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar];
}

const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n');

  console.log(grid);

  const startRow = grid.findIndex(row => row.includes('S'));
  const startCol = Array.from(grid[startRow]).findIndex(col => col === 'S');
  const startPosition = [startRow, startCol];

  console.log({startPosition});

  // First find one neighbor
  let currentPosition;
  for (let neighborVector of NEIGHBORS) {
    const neighborPosition = add(neighborVector, startPosition);

    if (neighborPosition[0] < 0 || neighborPosition[0] >= grid.length
        || neighborPosition[1] < 1 || neighborPosition[1] >= grid[0].length) continue;

    if(adjacency[grid[neighborPosition[0]][neighborPosition[1]]].some(adjacentVector =>
        eq(mul(adjacentVector, -1), neighborVector))) {
      console.log(`Start at ${neighborPosition}`);
      currentPosition = neighborPosition;
    }
  }

  // Then keep adding to the loop
  let lastPosition = startPosition;
  let positionList = [lastPosition];
  while (!eq(currentPosition, startPosition)) {
    positionList.push(currentPosition);
    // Find a new connect square without backtracking
    let newPosition = adjacency[grid[currentPosition[0]][currentPosition[1]]]
          .map(v => add(v, currentPosition))
          .find(position => {
            return !eq(position, lastPosition)
          });
    lastPosition = currentPosition;
    currentPosition = newPosition;
    console.log({currentPosition});
  }

  console.log(`Answer = ${positionList.length / 2}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
