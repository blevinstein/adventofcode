
const fs = require('fs');

const DEBUG = true;

function nextGrid(grid) {
  const h = grid.length;
  const w = grid[0].length;
  let newGrid = Array.from(grid.map(row => Array.from(row)));
  let moves = 0;
  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      if (grid[i][j] == '>' && grid[i][(j+1)%w] == '.') {
        // Move east
        newGrid[i][j] = '.';
        newGrid[i][(j+1)%w] = '>';
        moves++;
      }
    }
  }
  grid = Array.from(newGrid.map(row => Array.from(row)));
  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      if (grid[i][j] == 'v' && grid[(i+1)%h][j] == '.') {
        // Move south next
        newGrid[i][j] = '.';
        newGrid[(i+1)%h][j] = 'v';
        moves++;
      }
    }
  }
  return [newGrid, moves];
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => Array.from(line));

  let grid = input;
  let step = 0;
  while (true) {
    console.log(`Step: ${step++}`);
    console.log(`Grid:\n${grid.map(row => row.join('')).join('\n')}`);
    let [newGrid, moves] = nextGrid(grid);
    console.log(`Moves=${moves}`);
    grid = newGrid;
    if (!moves) break;
  }

  console.log(`Move=${step}`);

  console.log('Done');
}

main();
