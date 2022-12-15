
import fs from 'fs';

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function dist(a, b) {
  return sub(a, b).map(Math.abs).reduce((a, b) => a + b);
}

function eq(a, b) {
  return a[0] == b[0] && a[1] == b[1];
}

function isPossible(input, coordMax, possiblePosition) {
  if (possiblePosition[0] < 0 || possiblePosition[0] > coordMax ||
      possiblePosition[1] < 0 || possiblePosition[1] > coordMax) {
    return false;
  }
  for (let line of input) {
    const radius = dist(line.sensor, line.beacon);
    const possibleDist = dist(line.sensor, possiblePosition);
    if (eq(possiblePosition, line.beacon) || possibleDist <= radius) {
      return false;
    }
  }
  return true;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(line => {
    const [_, xSensor, ySensor, xBeacon, yBeacon] =
      /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/
      .exec(line)
      .map(Number);
    return { sensor: [xSensor, ySensor], beacon: [xBeacon, yBeacon] };
  });
  const coordMax = Number(process.argv[3]);

  // Check all possible positions, which are just outside the radius of the sensor
  let positionsChecked = 0;
  for (let line of input) {
    const radius = dist(line.sensor, line.beacon);
    for (let y = line.sensor[1] - radius - 1; y <= line.sensor[1] + radius + 1; ++y) {
      const xRadius = radius - Math.abs(line.sensor[1] - y) + 1;
      for (let coord of [[line.sensor[0] - xRadius, y], [line.sensor[0] + xRadius, y]]) {
        positionsChecked++;
        if (isPossible(input, coordMax, coord)) {
          console.log(`Found solution: ${coord}`);
          console.log(`Frequency: ${coord[0] * 4e6 + coord[1]}`);
          return;
        }
        if (positionsChecked > 0 && positionsChecked % 1e7 == 0) {
          console.log(`Positions checked: ${positionsChecked}`);
        }
      }
    }
  }
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
