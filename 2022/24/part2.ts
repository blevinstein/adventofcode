
import fs from 'fs';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

const vectors = {
  '<': [-1, 0],
  '>': [1, 0],
  '^': [0, -1],
  'v': [0, 1],
};

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function dist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function positiveMod(a, b) {
  if (b < 0) throw new Error(`Expected b > 0 but was ${b}`);
  const positiveA = a < 0 ? a + Math.ceil(Math.abs(a) / b) * b : a;
  return positiveA % b;
}

function eq(a, b) {
  return a[0] == b[0] && a[1] == b[1];
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

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const lines = rawInput.split('\n');
  const width = lines[0].length - 2;
  const height = lines.length - 2;
  console.log({width, height});

  // Input checking
  if (lines[0][1] != '.') throw new Error('No entry point');
  if (lines[height + 1][width] != '.') throw new Error('No exit point');
  const startPosition = [0, -1];
  const endPosition = [width - 1, height];

  // Input parsing
  const blizzards = [];
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      if (lines[y+1][x+1] == '.') continue;
      blizzards.push({
        start: [x, y],
        vector: vectors[lines[y+1][x+1]],
        char: lines[y+1][x+1],
      });
    }
  }

  function positionOf(blizzard, time) {
    return [
      positiveMod(blizzard.start[0] + blizzard.vector[0] * time, width),
      positiveMod(blizzard.start[1] + blizzard.vector[1] * time, height),
    ];
  }

  const grids = [];
  for (let t = 0; t < width * height; ++t) {
    const grid = new Map;
    for (let blizzard of blizzards) {
      const currentPosition = positionOf(blizzard, t);
      grid.set(String(currentPosition),
          (grid.get(String(currentPosition)) || []).concat([blizzard.char]));
    }
    grids.push(grid);
  }

  function drawGrid(time) {
    const grid = grids[time % (width * height)];

    console.log(`\nAt time ${time}:`);
    for (let x = 0; x < width+2; ++x) process.stdout.write('#');
    process.stdout.write('\n');
    for (let y = 0; y < height; ++y) {
      process.stdout.write('#');
      for (let x = 0; x < width; ++x) {
        const contents = grid.get(String([x, y]));
        if (!contents) {
          process.stdout.write('.');
        } else if (contents.length > 1) {
          process.stdout.write('0123456789ABCDEFXXXXX'[contents.length]);
        } else {
          process.stdout.write(contents[0]);
        }
      }
      process.stdout.write('#\n');
    }
    for (let x = 0; x < width+2; ++x) process.stdout.write('#');
    process.stdout.write('\n');
  }

  // Graph search
  async function graphSearch(initialState, goal) {
    const scoringFunction = state => dist(state.position, goal) + state.time;
    const stack = new MinPriorityQueue(scoringFunction);
    const visited = new Set;
    stack.enqueue(initialState);
    let result = null;
    let tick = 0;
    const sampleInterval = 1e4;
    await interruptableWhile(() => stack.size() > 0 && !result, () => {
      const current = stack.dequeue();

      if (++tick % sampleInterval == 0) {
        console.log(`Tick ${tick} stack size ${stack.size()} score ${scoringFunction(current)} sample ${JSON.stringify(current)}`);
      }

      if (eq(current.position, goal)) {
        //console.log(`Solved! ${current.position} at ${current.time}`);
        result = current;
        return;
      }
      if (!eq(current.position, startPosition) && !eq(current.position, endPosition)
          && (current.position[0] < 0 || current.position[1] < 0 ||
              current.position[0] >= width || current.position[1] >= height)) {
        //console.log('Outside the board');
        return;
      }
      const state = current.position.concat([current.time]);
      if (visited.has(String(state))) {
        return;
      } else {
        visited.add(String(state));
      }
      if (grids[current.time % (width * height)].has(String(current.position))) {
        //console.log('Blocked by blizzard');
        return;
      }
      // Option 1: stay still
      stack.enqueue({ position: current.position, time: current.time + 1 });
      // Option 2: move
      for (let move of Object.values(vectors)) {
        const newPosition = add(move, current.position);
        stack.enqueue({ position: newPosition, time: current.time + 1 });
      }
    });
    if (!result) throw new Error('No path found');
    return result;
  }

  const firstTrip = await graphSearch({ position: startPosition, time: 0}, endPosition);
  console.log(firstTrip);
  const returnTrip = await graphSearch({ position: endPosition, time: firstTrip.time }, startPosition);
  console.log(returnTrip);
  const secondTrip = await graphSearch({ position: startPosition, time: returnTrip.time }, endPosition);
  console.log(secondTrip);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
