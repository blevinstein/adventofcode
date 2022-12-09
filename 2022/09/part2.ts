
import fs from 'fs';

type Vector = [number, number];

const dirToVec = {
  'R': [1, 0],
  'U': [0, 1],
  'L': [-1, 0],
  'D': [0, -1],
};

const zeroVec = [0, 0];

function add(a: Vector, b: Vector): Vector {
  return [a[0] + b[0], a[1] + b[1]];
}

function sub(a: Vector, b: Vector): Vector {
  return [a[0] - b[0], a[1] - b[1]];
}

function vecToStr(v: Vector): string {
  return v.join(',');
}

function sign(v: Vector): number {
  return [Math.sign(v[0]), Math.sign(v[1])];
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const moves: [string, number][] = rawInput.split('\n').map(line => {
    const [dir, numString] = line.split(' ');
    return [dir, Number(numString)];
  });
  let knots = Array.from({length: 10}, () => zeroVec);
  let trail = new Set([vecToStr(zeroVec)]);
  for (let [dir, steps] of moves) {
    const dirVec = dirToVec[dir];
    for (let i = 0; i < steps; ++i) {
      // Update the head
      knots[0] = add(knots[0], dirVec);
      // Update the trailing knots
      for (let j = 1; j < knots.length; ++j) {
        const diff = sub(knots[j-1], knots[j]);
        if (Math.abs(diff[0]) > 1 || Math.abs(diff[1]) > 1) {
          knots[j] = add(knots[j], sign(diff));
        }
      }
      trail.add(vecToStr(knots[knots.length - 1]));
    }
  }
  console.log(trail);
  console.log(trail.size);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
