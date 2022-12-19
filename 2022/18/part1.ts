
import fs from 'fs';

const sides = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(line => line.split(',').map(Number));
  const drop = new Set(input.map(String));
  let surfaceArea = 0;
  for (let part of input) {
    for (let side of sides) {
      if (!drop.has(String(add(part, side)))) {
        surfaceArea++;
      }
    }
  }
  console.log(surfaceArea);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
