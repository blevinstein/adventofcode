
import fs from 'fs';

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(s => Array.from(s));

  //console.log(grid.map(line => line.join('')).join('\n'));
  //console.log('**');

  // Move all rocks north, modify grid
  for (let c = 0; c < grid[0].length; ++c) {
    let lastEmptyRow = null;
    for (let r = 0; r < grid.length; ++r) {
      switch (grid[r][c]) {
        case '.':
          if (lastEmptyRow == null) {
            //console.log(`empty ${c},${r}`);
            lastEmptyRow = r;
          } else {
            //console.log(`empty skip ${c},${r}`);
          }
          break;
        case '#':
          lastEmptyRow = null;
          break;
        case 'O':
          if (lastEmptyRow != null) {
            //console.log(`shift ${c},${r} => ${lastEmptyRow}`);
            grid[r][c] = '.';
            grid[lastEmptyRow][c] = 'O';
            lastEmptyRow++;
          } else {
            //console.log(`cannot move ${c},${r}`);
          }
          break;
        default:
          throw Error('Unrecognized input');
      }
    }
  }

  //console.log(grid.map(line => line.join('')).join('\n'));
  console.log(grid
      .map((row, i) => row.filter(s => s === 'O').length * (grid.length - i))
      .reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
