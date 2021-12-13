
const fs = require('fs');

const OFFSETS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];

const DEBUG = true;

function neighbors(r, c) {
  return OFFSETS
      .map(offset => [r + offset[0], c + offset[1]])
      .filter(position => 0 <= position[0] && position[0] < 10
          && 0 <= position[1] && position[1] < 10);
}

function key(r, c) {
  return `${r},${c}`;
}

function coords(key) {
  return key.split(',').map(s => parseInt(s));
}

async function main() {
  const state = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(row => Array.from(row).map(s => parseInt(s)));

  const STEPS = 100;
  let flashes = 0;
  for (let step = 0; step < STEPS; ++step) {
    // Increment
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 10; ++j) {
        state[i][j]++;
      }
    }
    // Flash
    const flashed = new Set;
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 10; ++j) {
        // Flood
        const stack = [[i, j]];
        while (stack.length > 0) {
          const [r, c] = stack.pop();
          if (state[r][c] >= 10 && !flashed.has(key(r, c))) {
            //console.log(`flash ${r},${c}`);
            flashed.add(key(r, c));
            for (let neighbor of neighbors(r, c)) {
              state[neighbor[0]][neighbor[1]]++;
              stack.push(neighbor);
            }
          }
        }
      }
    }
    // Clear
    flashes += flashed.size;
    for (let flash of flashed) {
      const [i, j] = coords(flash);
      state[i][j] = 0;
    }
    if (DEBUG) {
      for (let i = 0; i < 10; ++i) {
        for (let j = 0; j < 10; ++j) {
          process.stdout.write(`${state[i][j]}`);
        }
        process.stdout.write('\n');
      }
      process.stdout.write('\n');
    }
  }

  console.log(`Flashes=${flashes}`);
}

main();
