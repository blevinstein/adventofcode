
const fs = require('fs');

const DEBUG = true;

function keyOf(position) {
  return position.join(',');
}

// coords = list of coords to split at, up to 8 cubes result
// coords[i] = null or undefined where we DONT want to split
function split(cube, coords) {
  //console.log(`split ${JSON.stringify(coords)}`);
  if (coords[0] != null && (coords[0] < cube.x[0] || coords[0] >= cube.x[1])) throw Error(`Bad x split: ${coords[0]} in ${cube.x}`);
  if (coords[1] != null && (coords[1] < cube.y[0] || coords[1] >= cube.y[1])) throw Error('Bad y split');
  if (coords[2] != null && (coords[2] < cube.z[0] || coords[2] >= cube.z[1])) throw Error('Bad z split');
  if (coords[0] == null && coords[1] == null && coords[2] == null) return [cube];

  let cubes = [cube];
  if (coords[0] != null) {
    cubes = cubes.flatMap(cube => [{
      x: [cube.x[0], coords[0]],
      y: cube.y,
      z: cube.z,
      state: cube.state
    }, {
      x: [coords[0] + 1, cube.x[1]],
      y: cube.y,
      z: cube.z,
      state: cube.state
    }]);
  }
  if (coords[1] != null) {
    cubes = cubes.flatMap(cube => [{
      x: cube.x,
      y: [cube.y[0], coords[1]],
      z: cube.z,
      state: cube.state
    }, {
      x: cube.x,
      y: [coords[1] + 1, cube.y[1]],
      z: cube.z,
      state: cube.state
    }]);
  }
  if (coords[2] != null) {
    cubes = cubes.flatMap(cube => [{
      x: cube.x,
      y: cube.y,
      z: [cube.z[0], coords[2]],
      state: cube.state
    }, {
      x: cube.x,
      y: cube.y,
      z: [coords[2] + 1, cube.z[1]],
      state: cube.state
    }]);
  }
  //console.log(`output is ${cubes.length} cubes`);
  return cubes;
}

function overlaps(a, b) {
  return a.x[1] >= b.x[0] && a.x[0] <= b.x[1] &&
      a.y[1] >= b.y[0] && a.y[0] <= b.y[1] &&
      a.z[1] >= b.z[0] && a.z[0] <= b.z[1];
}

function includes(a, b) {
  return a.x[0] <= b.x[0] && b.x[1] <= a.x[1] &&
      a.y[0] <= b.y[0] && b.y[1] <= a.y[1] &&
      a.z[0] <= b.z[0] && b.z[1] <= a.z[1];
}

function volumeOf(cube) {
  return (cube.x[1] - cube.x[0] + 1) * (cube.y[1] - cube.y[0] + 1) * (cube.z[1] - cube.z[0] + 1);
}

// Returns a split by coords of b
function splitBy(a, b) {
  let cubes = split(a, [
      b.x[0] > a.x[0] && b.x[0] <= a.x[1] ? b.x[0] - 1 : null,
      b.y[0] > a.y[0] && b.y[0] <= a.y[1] ? b.y[0] - 1 : null,
      b.z[0] > a.z[0] && b.z[0] <= a.z[1] ? b.z[0] - 1 : null
  ]);
  cubes = cubes.flatMap(cube => split(cube, [
      b.x[1] >= cube.x[0] && b.x[1] < cube.x[1] ? b.x[1] : null,
      b.y[1] >= cube.y[0] && b.y[1] < cube.y[1] ? b.y[1] : null,
      b.z[1] >= cube.z[0] && b.z[1] < cube.z[1] ? b.z[1] : null
  ]));
  return cubes;
}

/*
function union(a, b) {
  // While a intersects but does not include b, split b, then repeat on individual pieces
  // If included, remove. If not included, add to result.
  let bList = [b];
  const result = [a];
  while (bList.length > 0) {
    const currentB = bList.pop();
    if (overlaps(a, currentB) && !includes(a, currentB)) {
      bList = bList.concat(splitBy(currentB, a));
    } else if (!overlaps(a, currentB)) {
      result.push(currentB);
    }
  }
  return result;
}
*/

function diff(a, b) {
  // While a intersects but not included by b, split a, then repeat on individual pieces
  // If a included by b, remove. If not included, add to result.
  let aList = [a];
  const result = [];
  while (aList.length > 0) {
    const currentA = aList.pop();
    //console.log(b);
    //console.log(currentA);
    if (overlaps(currentA, b) && !includes(b, currentA)) {
      aList = aList.concat(splitBy(currentA, b));
    } else if (!overlaps(currentA, b)) {
      result.push(currentA);
    } else {
    }
  }
  return result;
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => {
        const match = /(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)/.exec(line);
        return {
          state: match[1],
          x: [parseInt(match[2]), parseInt(match[3])],
          y: [parseInt(match[4]), parseInt(match[5])],
          z: [parseInt(match[6]), parseInt(match[7])],
        };
      });

  //console.log(diff({x: [0, 10], y: [0, 10], z: [0, 10]}, {x: [5,6], y: [5,6], z: [5,6]}));
  //

  let stepCount = 0;
  let cubes = [];
  for (let step of input) {
    console.log(stepCount++);
    if (step.state == 'on') {
      let addedCubes = [step];
      for (let existingCube of cubes) {
        addedCubes = addedCubes.flatMap(addedCube => diff(addedCube, existingCube));
      }
      //console.log(`Add ${addedCubes.length} cubes`);
      cubes = cubes.concat(addedCubes);
    } else {
      cubes = cubes.flatMap(cube => diff(cube, step));
      //console.log(`Subtract, ${cubes.length} remain`);
    }
  }
  console.log(`Total on = ${cubes.map(cube => volumeOf(cube)).reduce((a, b) => a + b)}`);

  console.log('Done');
}

main();
