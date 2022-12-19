
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

  const minX = Math.min(...input.map(p => p[0]));
  const minY = Math.min(...input.map(p => p[1]));
  const minZ = Math.min(...input.map(p => p[2]));
  const maxX = Math.max(...input.map(p => p[0]));
  const maxY = Math.max(...input.map(p => p[1]));
  const maxZ = Math.max(...input.map(p => p[2]));

  // Run floodfill and return points on the interior, OR null if not contained
  function floodFill(point) {
    //console.log(`Flood fill start ${point}`);
    const stack = [point];
    const visitedSet = new Set;
    while (stack.length > 0) {
      const current = stack.pop();
      if (drop.has(String(current))) continue;
      if (visitedSet.has(String(current))) continue;

      if (current[0] < minX || current[0] > maxX ||
          current[1] < minY || current[1] > maxY ||
          current[2] < minZ || current[2] > maxZ) {
        //console.log(`Flood fill abort`);
        return null;
      }

      visitedSet.add(String(current));
      for (let side of sides) {
        stack.push(add(current, side));
      }
    }
    //console.log(`Flood fill complete ${visitedSet}`);
    return visitedSet;
  }

  let interiorSet = new Set;
  let surfaceArea = 0;
  for (let point of input) {
    for (let side of sides) {
      const newPoint = add(point, side);
      if (!drop.has(String(newPoint) && !interiorSet.has(String(newPoint)))) {
        const floodResult = floodFill(newPoint);
        if (floodResult) {
          for (let interiorPointStr of floodResult) {
            interiorSet.add(interiorPointStr);
          }
        } else {
          surfaceArea++;
        }
      }
    }
  }
  console.log(surfaceArea);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
