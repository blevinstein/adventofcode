
const fs = require('fs');

const DEBUG = true;

function neighbors(w, h, x, y) {
  return [
    [x+1, y],
    [x-1, y],
    [x, y+1],
    [x, y-1]
  ].filter(n => 0 <= n[0] && n[0] < w && 0 <= n[1] && n[1] < h);
}

function manhattanDist(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function insertPath(paths, newPath) {
  // Binary search
  let min = 0;
  let max = paths.length;
  while (max - min > 1) {
    const mid = Math.floor((max + min) / 2);
    if (paths[mid].minRisk == newPath.minRisk) {
      paths.splice(mid, 0, newPath);
      return;
    } else if (paths[mid].minRisk > newPath.minRisk) {
      min = mid;
    } else {
      max = mid;
    }
  }
  paths.splice(min, 0, newPath);
}

function buildFullMap(corner) {
  const width = corner.length;
  const height = corner[0].length;
  const map = [];
  for (let y = 0; y < height * 5; ++y) {
    const row = [];
    for (let x = 0; x < width * 5; ++x) {
      const bonus = Math.floor(x / width) + Math.floor(y / height);
      row.push((corner[y % height][x % width] + bonus - 1) % 9 + 1);
    }
    map.push(row);
  }
  return map;
}

async function main() {
  let risk = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(row => Array.from(row).map(s => parseInt(s)));

  risk = buildFullMap(risk);

  const height = risk.length;
  const width = risk[0].length;
  const minRiskAtPos = new Map;
  let paths = [{risk: 0, position: [0, 0], minRisk: manhattanDist(0, 0, width - 1, height - 1), path: [[0, 0]]}];
  while (true) {
    const currentPath = paths.pop();
    const currentPosition = currentPath.position;

    // Short circuit
    const currentKey = `${currentPosition[0]},${currentPosition[1]}`;
    const minPreviousRisk = minRiskAtPos.get(currentKey);
    if (minPreviousRisk && currentPath.risk >= minPreviousRisk) {
      if (DEBUG) {
        console.log(`Short circuit at position ${currentPosition} ${currentPath.risk} >= ${minPreviousRisk}`);
      }
      continue;
    }
    minRiskAtPos.set(currentKey, minPreviousRisk ? Math.min(minPreviousRisk, currentPath.risk) : currentPath.risk);

    if (currentPosition[0] == width - 1 && currentPosition[1] == height - 1) {
      console.log(`Solution! Total risk is ${currentPath.risk}`);
      console.log(currentPath);
      break;
    } else if (DEBUG) {
      console.log(`pop ${JSON.stringify(currentPath)}`);
    }
    for (let neighbor of neighbors(width, height, ...currentPosition)) {
      const currentRisk = risk[neighbor[1]][neighbor[0]];
      const newPath = {
        risk: currentPath.risk + currentRisk,
        position: neighbor,
        minRisk: currentPath.risk + currentRisk + manhattanDist(width - 1, height - 1, ...neighbor),
      };
      insertPath(paths, newPath);
    }
    if (DEBUG) { console.log(`paths ${paths.length}`); }
  }
}

main();
