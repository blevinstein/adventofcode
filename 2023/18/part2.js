
import fs from 'fs';

const directionVector = {
  R: [1, 0],
  U: [0, 1],
  D: [0, -1],
  L: [-1, 0],
};

const codeDirection = ['R', 'D', 'L', 'U'];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function mul(v, scalar) {
  return [v[0] * scalar, v[1] * scalar];
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
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line => {
    const raw = line.match(/(\w) (\d+) \(#(.+)\)/)[3];
    return [codeDirection[Number(raw[5])], parseInt(raw.slice(0, 5), 16)];
  });

  let position = [0, 0];
  const points = [];
  const border = [];
  for (let [direction, length] of input) {
    const newPosition = add(position, mul(directionVector[direction], length));
    const min = [
      Math.min(position[0], newPosition[0]),
      Math.min(position[1], newPosition[1]),
    ];
    const max = [
      Math.max(position[0], newPosition[0]),
      Math.max(position[1], newPosition[1]),
    ];
    border.push([min, max, direction]);
    points.push(newPosition);
    position = newPosition;
  }

  const minX = points.map(([x, y]) => x).reduce((a, b) => a < b ? a : b);
  const maxX = points.map(([x, y]) => x).reduce((a, b) => a > b ? a : b);
  const minY = points.map(([x, y]) => y).reduce((a, b) => a < b ? a : b);
  const maxY = points.map(([x, y]) => y).reduce((a, b) => a > b ? a : b);

  let inside = false;
  // Area of the border
  let count = border.map(([min, max]) => (max[0] - min[0] + 1) * (max[1] - min[1] + 1) - 1)
      .reduce((a, b) => a + b);
  let sample = 0;
  for (let y = minY; y <= maxY; ++y) {

    if (++sample % 1e5 === 0) console.log({ y, maxY});

    // Filter border segments by y, and sort by x
    let borderSegments = border
        .filter(([min, max, direction]) => min[1] <= y && y <= max[1])
        .sort((a, b) => {
          if (a[0][0] != b[0][0]) {
            return a[0][0] - b[0][0];
          } else {
            return a[1][0] - b[1][0];
          }
        });
    let lastX = minX;
    let inside = false;
    for (let [min, max, direction] of borderSegments) {
      if (inside && min[0] > lastX) {
        count += min[0] - lastX - 1;
      }
      if (['U', 'D'].includes(direction) && y < max[1]) {
        inside = !inside;
      }
      lastX = max[0];
    }
  }
  console.log({ count });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
