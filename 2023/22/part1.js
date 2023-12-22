
import fs from 'fs';

// Check if two boxes overlap in xy, ignoring z
function overlap2(a, b) {
  // return a.min.x <= b.max.x && b.min.x <= a.max.x
  //    && a.min.y <= b.max.y && b.min.y <= a.max.y;
  return a[0][0] <= b[1][0] && b[0][0] <= a[1][0]
      && a[0][1] <= b[1][1] && b[0][1] <= a[1][1];
}

// Check if two boxes overlap in xyz
function overlap3(a, b) {
  // return a.min.x <= b.max.x && b.min.x <= a.max.x
  //    && a.min.y <= b.max.y && b.min.y <= a.max.y
  //    && a.min.z <= b.max.z && b.min.z <= a.max.z;
  return a[0][0] <= b[1][0] && b[0][0] <= a[1][0]
      && a[0][1] <= b[1][1] && b[0][1] <= a[1][1]
      && a[0][2] <= b[1][2] && b[0][2] <= a[1][2];
}

function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function atHeight(brick, height) {
  return brick.map(coord => add3(coord, [0, 0, height]));
}

async function main() {
  const bricks = fs.readFileSync(process.argv[2]).toString().trim().split('\n')
      .map(line => line.split('~').map(corner => corner.split(',').map(coord => Number(coord))))
      // Sort by min z coordinate ascending
      .sort((a, b) => a[0][2] - b[0][2]);
  // Calculate settled positions and support graph
  const brickHeights = [];
  const brickSupports = [];
  for (let [i, newBrick] of Object.entries(bricks)) {
    const otherBricks = bricks.slice(0, i)
        .map((b, j) => ({ brick: atHeight(b, brickHeights[j]), index: j }))
        .filter(({ brick: b }) => overlap2(newBrick, b));
    brickHeights.push(
        // new min z
      otherBricks.map(({ brick: b }) => b[1][2] + 1).reduce((a, b) => Math.max(a, b), 1)
        // current min z
        - newBrick[0][2]);
    brickSupports.push(otherBricks
        .filter(({ brick: b }) => b[1][2] + 1 === newBrick[0][2] + brickHeights[i])
        .map(({ index: j }) => j));
  }
  let result = 0;
  for (let i = 0; i < bricks.length; ++i) {
    // See if we can remove brick i
    if (brickSupports.slice(i).every(supportList => !supportList.includes(i) || supportList.length > 1)) {
      result++;
    }
  }
  console.log({ result });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
