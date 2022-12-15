
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

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(line => {
    const [_, xSensor, ySensor, xBeacon, yBeacon] =
      /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/
      .exec(line)
      .map(Number);
    return { sensor: [xSensor, ySensor], beacon: [xBeacon, yBeacon] };
  });
  const yQuery = Number(process.argv[3]);

  const emptyPositions = new Set();
  for (let line of input) {
    const radius = dist(line.sensor, line.beacon);
    const xRadius = radius - Math.abs(line.sensor[1] - yQuery);
    for (let x = line.sensor[0] - xRadius; x <= line.sensor[0] + xRadius; ++x) {
      if (!eq(line.beacon, [x, yQuery])) {
        emptyPositions.add(x);
      }
    }
  }
  console.log(emptyPositions.size);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
