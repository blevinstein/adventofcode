
const fs = require('fs');

function neighbors(i, j) {
  return [
    [i+1, j],
    [i-1, j],
    [i, j+1],
    [i, j-1]
  ];
}

async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(row => Array.from(row).map(s => parseInt(s)));

  const height = input.length;
  const width = input[0].length;
  const k = (i, j) => i * width + j;

  const basinMap = new Map;
  let basinCount = 0;
  const basins = [];
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      if (input[i][j] == 9) continue;
      if (basinMap.has(k(i, j))) continue;
      // Floodfill
      const frontier = [[i, j]];
      const basin = new Set;
      while (frontier.length > 0) {
        const current = frontier.pop();
        basin.add(k(...current));
        basinMap.set(k(...current), basinCount);
        for (let next of neighbors(...current)) {
          if (next[0] < 0 || next[0] == height) continue;
          if (next[1] < 0 || next[1] == width) continue;
          if (basin.has(k(...next))) continue;
          if (input[next[0]][next[1]] == 9) continue;
          frontier.push(next);
        }
      }
      basins.push(basin);
      //console.log(`push basin, size=${basin.size}`);
      basinCount++;
    }
  }

  const basinSizes = basins.map(basin => basin.size);
  basinSizes.sort((a, b) => a < b ? 1 : -1);
  console.log(basinSizes.slice(0, 3).reduce((a, b) => a * b));
}

main();
