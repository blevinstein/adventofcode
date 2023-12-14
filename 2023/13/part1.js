
import fs from 'fs';

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

function range2d(rows, cols) {
  return range(rows).flatMap((r) => range(cols).map((c) => [r, c]));
}

async function main() {
  const grids = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n')
      .map(part => part.split('\n'));

  let result = 0;

  for (let grid of grids) {
    // Try each vertical reflection
    for (let s = 1; s < grid[0].length; ++s) {
      const cols = Math.min(s, grid[0].length - s);
      if (range2d(grid.length, cols).every(([r, c]) =>
          grid[r][s - c - 1] === grid[r][s + c])) {
        console.log(`vertical ${s}`);
        result += s;
      }
    }
    // Try each horizontal reflection
    for (let s = 1; s < grid.length; ++s) {
      const rows = Math.min(s, grid.length - s);
      if (range2d(rows, grid[0].length).every(([r, c]) =>
          grid[s - r - 1][c] === grid[s + r][c])) {
        console.log(`horizontal ${s}`);
        result += 100 * s;
      }
    }
  }
  console.log({result});
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
