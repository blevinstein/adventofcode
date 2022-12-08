
import fs from 'fs';

function isVisible(grid, i, j) {
  let visibleLeft = true;
  let visibleRight = true;
  let visibleTop = true;
  let visibleBottom = true;
  for (let ii = 0; ii < i; ++ii) {
    if (grid[ii][j] >= grid[i][j]) {
      visibleTop = false;
      break;
    }
  }
  for (let ii = i + 1; ii < grid.length; ++ii) {
    if (grid[ii][j] >= grid[i][j]) {
      visibleBottom = false;
      break;
    }
  }
  for (let jj = 0; jj < j; ++jj) {
    if (grid[i][jj] >= grid[i][j]) {
      visibleLeft = false;
      break;
    }
  }
  for (let jj = j + 1; jj < grid[0].length; ++jj) {
    if (grid[i][jj] >= grid[i][j]) {
      visibleRight = false;
      break;
    }
  }
  return visibleLeft || visibleRight || visibleTop || visibleBottom;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const grid = rawInput.split('\n');
  let visibleCount = 0;
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid[0].length; ++j) {
      if (isVisible(grid, i, j)) {
        visibleCount++;
      }
    }
  }
  console.log(visibleCount);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
