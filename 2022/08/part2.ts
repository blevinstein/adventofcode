
import fs from 'fs';

function scenicScore(grid, i, j) {
  let visibleLeft = 0;
  let visibleRight = 0;
  let visibleTop = 0;
  let visibleBottom = 0;
  for (let ii = i - 1; ii >= 0; --ii) {
    visibleTop++;
    if (grid[ii][j] >= grid[i][j]) {
      break;
    }
  }
  for (let ii = i + 1; ii < grid.length; ++ii) {
    visibleBottom++;
    if (grid[ii][j] >= grid[i][j]) {
      break;
    }
  }
  for (let jj = j - 1; jj >= 0; --jj) {
    visibleLeft++;
    if (grid[i][jj] >= grid[i][j]) {
      break;
    }
  }
  for (let jj = j + 1; jj < grid[0].length; ++jj) {
    visibleRight++;
    if (grid[i][jj] >= grid[i][j]) {
      break;
    }
  }
  return visibleLeft * visibleRight * visibleTop * visibleBottom;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const grid = rawInput.split('\n');
  let maxScore = 0;
  let visibleCount = 0;
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid[0].length; ++j) {
      const score = scenicScore(grid, i, j);
      if (score > maxScore) {
        maxScore = score;
      }
    }
  }
  console.log(maxScore);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
