
import fs from 'fs';

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(a, scalar) {
  return [a[0] * scalar, a[1] * scalar];
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(line =>
      line.split(' -> ').map(pairStr => pairStr.split(',').map(s => Number(s))));

  const grid = new Set();
  for (let path of input) {
    // for each pair of points in the path
    for (let i = 0; i < path.length - 1; ++i) {
      const start = path[i];
      const end = path[i+1];
      const offset = sub(path[i+1], path[i]);
      const step = offset.map(Math.sign);
      if (step[0] * step[1] != 0) throw Error(`Unexpected step: ${step}`);
      const length = offset.map(Math.abs).reduce((a, b) => a + b);
      // add all points to the set
      for (let j = 0; j <= length; ++j) {
        grid.add(String(add(path[i], scale(step, j))));
      }
    }
  }

  const maxDepth = input.flat().map(point => point[1]).reduce((a, b) => Math.max(a, b));


  const startPos = [500, 0];
  let sand = 0;
  let sandPosition = startPos;
  outer: while (true) {
    if (grid.has(String(sandPosition))) throw new Error('Source blocked');

    // if we have exceeded maxDepth, stop
    if (sandPosition[1] > maxDepth) {
      break;
    }

    // if the sand can drop, it does
    for (let step of [[0, 1], [-1, 1], [1, 1]]) {
      if (!grid.has(String(add(sandPosition, step)))) {
        sandPosition = add(sandPosition, step);
        //console.log(`move ${sandPosition}`);
        continue outer;
      }
    }

    // if not, it settles
    sand++;
    grid.add(String(sandPosition));
    //console.log(`settle ${sandPosition}`);
    sandPosition = startPos;
  }
  console.log(sand);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
