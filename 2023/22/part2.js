
import fs from 'fs';

// Check if two boxes overlap in xy, ignoring z
function overlap2(a, b) {
  return a.min[0] <= b.max[0] && b.min[0] <= a.max[0]
      && a.min[1] <= b.max[1] && b.min[1] <= a.max[1];
}

// Check if two boxes overlap in xyz
function overlap3(a, b) {
  return a.min[0] <= b.max[0] && b.min[0] <= a.max[0]
      && a.min[1] <= b.max[1] && b.min[1] <= a.max[1]
      && a.min[2] <= b.max[2] && b.min[2] <= a.max[2];
}

function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

async function main() {
  const bricks = fs.readFileSync(process.argv[2]).toString().trim().split('\n')
      .map(line => {
        let [ min, max ] = line.split('~')
            .map(corner => corner.split(',').map(coord => Number(coord)));
        if (min[0] > max[0] || min[1] > max[1] || min[2] > max[2]) throw Error('Bad input');
        return { min, max };
      })
      // Sort by min z coordinate ascending
      .sort((a, b) => a.min[2] - b.min[2]);

  // Calculate settled positions and support graph
  const brickSupports = [];
  for (let [i, newBrick] of Object.entries(bricks)) {
    const otherBricks = bricks.slice(0, i)
        .filter(b => overlap2(newBrick, b));
    newBrick.height =
        // new min z
        otherBricks.map(b => b.max[2] + b.height + 1).reduce((a, b) => Math.max(a, b), 1)
        // current min z
        - newBrick.min[2];
  }

  for (let [i, newBrick] of Object.entries(bricks)) {
    brickSupports.push(bricks.slice(0, i)
        .map((b, j) => ({ brick: b, index: j }))
        .filter(({ brick: b }) => overlap2(newBrick, b))
        .filter(({ brick: b }) => b.max[2] + b.height + 1 === newBrick.min[2] + newBrick.height)
        .map(({ index: j }) => j));
  }

  let result = 0;
  for (let i = 0; i < bricks.length; ++i) {
    // Count falling blocks when brick i is removed
    const falling = [i];
    for (let j = i + 1; j < bricks.length; ++j) {
      if (bricks[j].min[2] + bricks[j].height > 1 && brickSupports[j].every(k => falling.includes(k))) falling.push(j);
    }
    //console.log(`Disintegrate ${i} ${bricks[i].min}~${bricks[i].max} makes ${falling.length - 1} fall`);
    result += falling.length - 1;
  }
  console.log({ result });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
