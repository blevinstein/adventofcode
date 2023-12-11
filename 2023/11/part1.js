
import fs from 'fs';

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

async function main() {
  const grid = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line => Array.from(line));
  const emptyRows = range(grid.length).filter(i => grid[i].every(c => c === '.'));
  const emptyCols = range(grid[0].length).filter(i => grid.every(row => row[i] === '.'));
  const galaxies = range(grid.length).flatMap(i => range(grid[0].length).map(j => [i, j]))
      .filter(([i, j]) => grid[i][j] === '#');

  function distance(a, b) {
    return Math.abs(a[0] - b[0])
        + Math.abs(a[1] - b[1])
        + emptyRows.filter(i => i > Math.min(a[0], b[0]) && i < Math.max(a[0], b[0])).length
        + emptyCols.filter(j => j > Math.min(a[1], b[1]) && j < Math.max(a[1], b[1])).length;
  }

  let totalDistance = 0;
  for (let i = 0; i < galaxies.length; ++i) {
    for (let j = i+1; j < galaxies.length; ++j) {
      totalDistance += distance(galaxies[i], galaxies[j]);
    }
  }

  console.log({emptyRows, emptyCols, galaxies, totalDistance});
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
