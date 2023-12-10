
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

  //console.log(grid);

  const startRow = grid.findIndex(row => row.includes('S'));
  const startCol = Array.from(grid[startRow]).findIndex(col => col === 'S');
  const startPosition = [startRow, startCol];

  console.log({startPosition});

  // First find one neighbor
  let currentPosition;
  let startAdjacency = [];
  for (let neighborVector of NEIGHBORS) {
    const neighborPosition = add(neighborVector, startPosition);

    if (neighborPosition[0] < 0 || neighborPosition[0] >= grid.length
        || neighborPosition[1] < 1 || neighborPosition[1] >= grid[0].length) continue;

    if(adjacency[grid[neighborPosition[0]][neighborPosition[1]]].some(adjacentVector =>
        eq(mul(adjacentVector, -1), neighborVector))) {
      currentPosition = neighborPosition;
      startAdjacency.push(neighborVector);
    }
  }
  let [startTile] = Object.entries(adjacency).find(([tile, adj]) => adj.every(a => startAdjacency.some(s => eq(s, a))));
  console.log({ startTile });

  // Modify grid to show the right start tile
  grid[startRow] = grid[startRow].slice(0, startCol) + startTile + grid[startRow].slice(startCol+1);

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
    //console.log({currentPosition});
  }

  // Scan for included tiles
  const positionSet = new Set(positionList.map(p => p.join(',')));
  let includedTiles = 0;
  for (let r = 0; r < grid.length; ++r) {
    let included = false;
    //console.log(`reset ${r}`);
    for (let c = 0; c < grid[0].length; ++c) {
      if (positionSet.has([r, c].join(','))) {
        if ('JL|'.includes(grid[r][c])) {
          //console.log(`pipe ${[r, c]}`);
          included = !included;
        }
      } else {
        if (included) {
          includedTiles++;
          //console.log(`include ${[r, c]}`);
        }
      }
    }
  }

  console.log({ includedTiles });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
