
import fs from 'fs';

function moveRocks(grid, direction) {
  // direction = 0, 1, 2, 3 = N, W, S, E

  const width = direction % 2 == 0 ? grid[0].length : grid.length;
  const height = direction % 2 == 0 ? grid.length : grid[0].length;

  function gridTransform(r, c) {
    switch (direction) {
      case 0:
        return [r, c];
      case 1:
        return [c, r];
      case 2:
        return [grid.length - r - 1, c];
      case 3:
        return [c, grid[0].length - r - 1];
      default:
        throw Error('Unrecognized direction');
    }
  }

  function gridGet(r, c) {
    const [i, j] = gridTransform(r, c);
    return grid[i][j];
  }

  function gridSet(r, c, value) {
    const [i, j] = gridTransform(r, c);
    grid[i][j] = value;
  }

  for (let c = 0; c < width; ++c) {
    let lastEmpty = null;
    for (let r = 0; r < height; ++r) {
      switch (gridGet(r, c)) {
        case '.':
          if (lastEmpty == null) {
            //console.log(`empty ${c},${r}`);
            lastEmpty = r;
          } else {
            //console.log(`empty skip ${c},${r}`);
          }
          break;
        case '#':
          lastEmpty = null;
          break;
        case 'O':
          if (lastEmpty != null) {
            //console.log(`shift ${c},${r} => ${lastEmpty}`);
            gridSet(r, c, '.');
            gridSet(lastEmpty, c, 'O');
            lastEmpty++;
          } else {
            //console.log(`cannot move ${c},${r}`);
          }
          break;
        default:
          throw Error('Unrecognized input');
      }
    }
  }
}

function cycle(grid) {
  for (let d = 0; d < 4; ++d) {
    moveRocks(grid, d);
  }
}

function stringOf(grid) {
  return grid.map(row => row.join('')).join('\n');
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(s => Array.from(s));

  /*
  for (let i = 0; i < 3; ++i) {
    cycle(grid);
    console.log(stringOf(grid));
    console.log();
  }
  */

  let cache = {};
  let cycleCount = 0;
  let fastForward = true;
  const maxCycles = 1e9;
  while (cycleCount < maxCycles) {
    if (fastForward && stringOf(grid) in cache) {
      const repeatLength = cycleCount - cache[stringOf(grid)];
      const remainingCycles = maxCycles - cycleCount;
      cycleCount += Math.floor(remainingCycles / repeatLength) * repeatLength;
      fastForward = false;
    } else {
      cache[stringOf(grid)] = cycleCount;
      cycleCount++;
      cycle(grid);
    }
  }

  console.log(grid
      .map((row, i) => row.filter(s => s === 'O').length * (grid.length - i))
      .reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
