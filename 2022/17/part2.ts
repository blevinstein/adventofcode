

import fs from 'fs';

const rawRocks = `
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`.trim();

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function interruptableWhile(condition, innerBlock) {
  return new Promise(async (resolve, reject) => {
    async function cycle() {
      if (await condition()) {
        await innerBlock();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    await cycle();
  });
}

function interruptableFor(condition, step, innerBlock) {
  return new Promise(async (resolve, reject) => {
    async function cycle() {
      if (await condition()) {
        await innerBlock();
        await step();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    await cycle();
  });
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();

  // Bottom left corner of each rock is [0, 0]
  const rocks = rawRocks.split('\n\n').map(rawRock => {
    const grid = rawRock.split('\n');
    return grid.flatMap((line, y) =>
        line.split('')
            // Get x coord before filtering
            .map((char, x) => [char, x])
            // Remove empty space
            .filter(([char, x]) => char == '#')
            // Return [x, y] coords, after inverting y
            .map(([char, x]) => [x, grid.length - y - 1]));
  });

  const maxX = 6;
  let scene = new Set();
  let maxY = -1;
  let tick = 0;

  function fits(rock, coord) {
    for (let part of rock) {
      const partCoord = add(part, coord);
      if (scene.has(String(partCoord)) ||
          partCoord[0] < 0 || partCoord[0] > maxX ||
          partCoord[1] < 0) {
        return false;
      }
    }
    return true;
  }

  function addRock(rock, coord) {
    for (let part of rock) {
      const partCoord = add(part, coord);
      scene.add(String(partCoord))
      if (partCoord[1] > maxY) {
        maxY = partCoord[1];
      }
    }
  }

  function visualGrid() {
    let result = '\n';
    for (let y = maxY; y >= 0; --y) {
      for (let x = 0; x <= maxX; ++x) {
        result += scene.has(String([x, y])) ? '#' : ' ';
      }
      result += '\n';
    }
    result += '-------\n';
    return result;
  }

  // Find all reachable space from a given height
  async function floodDown(startY) {
    function neighbors(coord) {
      return [
        [coord[0] - 1, coord[1] - 1],
        [coord[0], coord[1] - 1],
        [coord[0] + 1, coord[1] - 1]
      ].filter(n => n[0] >= 0 && n[0] <= maxX && n[1] >= 0);
    }

    const visited = new Set;
    const stack = Array.from(Array(7), (_, i) => [i, startY]);
    await interruptableWhile(() => stack.length > 0, () => {
      const current = stack.pop();
      if (visited.has(String(current))) return;
      visited.add(String(current));
      for (let neighbor of neighbors(current)) {
        if (!scene.has(String(neighbor))) {
          stack.push(neighbor);
        }
      }
    });
    const result = Array.from(visited).map((s) => {
      const [x, y] = s.split(',').map(Number);
      return [x, startY - y];
    });
    result.sort();
    return result;
  }

  const totalRocks = 1e12;
  let seenStates = new Map;
  let i = 0;
  let fastForwardHeight = 0;
  await interruptableFor(() => i < totalRocks, () => ++i, async () => {
    if (i > 0 && i % 1e3 == 0) {
      console.log(`Dropped ${i} rocks...`);
    }

    if (fastForwardHeight == 0) {
      const shape = await floodDown(maxY);
      const state = String([i % rocks.length, tick % rawInput.length, shape]);
      if (seenStates.has(state)) {
        const [oldI, oldMaxY, oldShape] = seenStates.get(state);
        console.log(`Repeat state, rock ${oldI}=>${i} height ${oldMaxY}=>${maxY} shape ${shape.join('/')}`);
        const cycles = Math.floor((totalRocks - i) / (i - oldI));
        console.log(`Fast forward ${cycles} cycles`);
        fastForwardHeight = cycles * (maxY - oldMaxY);
        i += cycles * (i - oldI);
      } else {
        seenStates.set(state, [i, maxY, shape]);
      }
    }

    const fallingRock = rocks[i % rocks.length];
    let x = 2;
    let y = maxY + 4;

    while (true) {
      // Lateral movement
      const jet = rawInput[tick++ % rawInput.length] == '>' ? 1 : -1;
      if (fits(fallingRock, [x + jet, y])) {
        x += jet;
      }
      // Downward movement
      if (fits(fallingRock, [x, y - 1])) {
        y--;
      } else {
        addRock(fallingRock, [x, y]);
        break;
      }
    }
  });

  console.log(maxY + fastForwardHeight + 1);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
