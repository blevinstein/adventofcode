
import fs from 'fs';

const directionVector = {
  R: [1, 0],
  U: [0, 1],
  D: [0, -1],
  L: [-1, 0],
};

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function eq(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.match(/(\w) (\d+) (.+)/).slice(1));

  let position = [0, 0];
  const border = [position];
  const verticalBorder = new Set;
  for (let [direction, length] of input) {
    for (let _ of range(Number(length))) {
      if (direction === 'D') verticalBorder.add(position.toString());

      position = add(position, directionVector[direction]);
      border.push(position);

      if (direction === 'U') verticalBorder.add(position.toString());
    }
  }

  const minX = border.map(([x, y]) => x).reduce((a, b) => a < b ? a : b);
  const maxX = border.map(([x, y]) => x).reduce((a, b) => a > b ? a : b);
  const minY = border.map(([x, y]) => y).reduce((a, b) => a < b ? a : b);
  const maxY = border.map(([x, y]) => y).reduce((a, b) => a > b ? a : b);

  console.log({minX, minY, maxX, maxY});

  const borderSet = new Set(border.map(p => p.toString()));
  let inside = false;
  let count = borderSet.size;
  console.log({ count });
  for (let y = minY; y <= maxY; ++y) {
    for (let x = minX; x <= maxX; ++x) {
      if (verticalBorder.has([x, y].toString())) {
        //console.log(`border ${[x, y]}`);
        inside = !inside;
      } else if (!borderSet.has([x, y].toString()) && inside) {
        //console.log(`interior ${[x, y]}`);
        count++;
      }
      //process.stdout.write(border.find(p => eq(p, [x, y])) ? '#' : '.');
      //process.stdout.write(verticalBorder.has([x, y].toString()) ? '#' : '.');
    }
    //process.stdout.write('\n');
  }
  console.log({ count });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
