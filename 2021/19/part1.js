
const fs = require('fs');

const DEBUG = true;

// Returns a map magnitude => [[coordA, coordB]]
function fingerprint(points) {
  const result = new Map;
  for (let i = 0; i < points.length; ++i) {
    for (let j = i + 1; j < points.length; ++j) {
      const mag = Math.pow(points[i][0] - points[j][0], 2)
          + Math.pow(points[i][1] - points[j][1], 2)
          + Math.pow(points[i][2] - points[j][2], 2);
      result.set(mag, (result.get(mag) || []).concat([points[i], points[j]]));
    }
  }
  return result;
}

/*
function mul3(a, b) {
  if (a.length < 3) throw Error(`Invalid mul3 arg: ${a}`);
  if (b.length < 3) throw Error(`Invalid mul3 arg: ${b}`);
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}
*/

function add3(a, b) {
  if (a.length < 3) throw Error(`Invalid add3 arg: ${a}`);
  if (b.length < 3) throw Error(`Invalid add3 arg: ${b}`);
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub3(a, b) {
  if (a.length < 3) throw Error(`Invalid sub3 arg: ${a}`);
  if (b.length < 3) throw Error(`Invalid sub3 arg: ${b}`);
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function pointKey(point) {
  return point.join(',');
}

function inBounds(point) {
  const [x,y,z] = point;
  return -1000 <= x && x <= 1000
      && -1000 <= y && y <= 1000
      && -1000 <= z && z <= 1000;
}

const PARITY = [
  [0, 1, -1],
  [-1, 0, 1],
  [1, -1, 0]
];

class Transform {
  constructor(matrix, offset = [0, 0, 0]) {
    if (matrix.length != 3 || matrix[0].length != 3) throw Error(`Bad matrix: ${matrix}`);
    this.matrix = matrix;
    this.offset = offset;
  }

  transformOne(point) {
    return add3([
      point[0] * this.matrix[0][0] + point[1] * this.matrix[0][1] + point[2] * this.matrix[0][2],
      point[0] * this.matrix[1][0] + point[1] * this.matrix[1][1] + point[2] * this.matrix[1][2],
      point[0] * this.matrix[2][0] + point[1] * this.matrix[2][1] + point[2] * this.matrix[2][2],
    ], this.offset);
  }

  transform(points) {
    return points.map(point => this.transformOne(point));
  }

  static allRotations() {
    let matrices = [];
    for (let xAxis of [0, 1, 2]) {
      for (let xAxisSign of [-1, 1]) {
        for (let yAxis of [0, 1, 2]) {
          if (xAxis == yAxis) continue;
          for (let yAxisSign of [-1, 1]) {
            let zAxis = 3 - xAxis - yAxis;
            let zAxisSign = xAxisSign * yAxisSign * PARITY[xAxis][yAxis];
            matrices.push([
              [xAxis == 0 ? xAxisSign : 0, yAxis == 0 ? yAxisSign : 0, zAxis == 0 ? zAxisSign : 0],
              [xAxis == 1 ? xAxisSign : 0, yAxis == 1 ? yAxisSign : 0, zAxis == 1 ? zAxisSign : 0],
              [xAxis == 2 ? xAxisSign : 0, yAxis == 2 ? yAxisSign : 0, zAxis == 2 ? zAxisSign : 0],
            ]);
          }
        }
      }
    }
    return matrices.map(mat => new Transform(mat));
  }
}

async function main() {
  let parts = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n\n');
  const scanners = parts.map(part => {
    const lines = part.split('\n');
    const id = parseInt(/--- scanner (\d+) ---/.exec(lines[0])[1]);
    return {
      id,
      points: lines.slice(1).map(line => line.split(',').map(s => parseInt(s)))
    };
  });

  // Define map
  const beacons = Array.from(scanners[0].points);
  const beaconSet = new Set(beacons.map(pointKey));
  console.log(`init beacons(${beacons.length}) beaconSet(${beaconSet.size}`);
  const scannerPositions = [[0, 0, 0]];

  function addScanner(scannerNew, baseFingerprint) {
    let fingerprintNew = fingerprint(scannerNew.points);;
    for (let [mag, coords] of fingerprintNew) {
      const originalPoints = baseFingerprint.get(mag);
      // if (DEBUG) console.log(`Matching points: ${originalPoints}`);
      if (!originalPoints) continue;
      const originalPointSet = new Set(originalPoints.map(pointKey));

      for (let originalPoint of originalPoints) {
        for (let proposedTransform of Transform.allRotations()) {
          // Add transformation to align one coord
          proposedTransform.offset = sub3(originalPoint, proposedTransform.transformOne(coords[0]))

          // First check: aligned to a matching point
          if (!originalPointSet.has(pointKey(proposedTransform.transformOne(coords[1])))) {
            continue;
          }
          if (DEBUG) console.log('Match!');

          // Second check: all points are not invalidated by previous scans
          let isValid = true;
          for (let beaconImage of proposedTransform.transform(scannerNew.points)) {
            // TODO: Relative to ALL scanners
            if (inBounds(beaconImage) && !beaconSet.has(pointKey(beaconImage))) {
              //if (DEBUG) console.log(`Invalidated: ${beaconImage} not in ${Array.from(beaconSet).join(' / ')}`);
              if (DEBUG) console.log(`Invalidated: ${beaconImage} not in ${beaconSet.size}`);
              isValid = false;
              break;
            }
          }
          if (!isValid) continue;

          scannerPositions.push(proposedTransform.offset);
          console.log(`Add ${scannerNew.id} to map at ${proposedTransform.offset}`);
          for (let beaconImage of proposedTransform.transform(scannerNew.points)) {
            beacons.push(beaconImage);
            beaconSet.add(pointKey(beaconImage));
          }
          return true;
        }
      }
    }
    return false;
  }

  let baseFingerprint = fingerprint(scanners[0].points);
  let remainingScanners = scanners.slice(1);
  let failures = 0;
  while (remainingScanners.length > 0) {
    console.log(`Scanners remaining: ${remainingScanners.length}`);
    const [candidateScanner] = remainingScanners.splice(0, 1);
    if (addScanner(candidateScanner, baseFingerprint)) {
      failures = 0;
      baseFingerprint = fingerprint(beacons);
    } else {
      remainingScanners.push(candidateScanner);
      if (failures++ > remainingScanners.length) throw Error('Failure loop');
    }
  }

  console.log(`Total beacons: ${beaconSet.size}`);
  console.log('Done');
}

main();
