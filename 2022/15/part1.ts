
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

function rangeTouches(a, b) {
  return a[1] >= b[0] - 1 && a[0] <= b[1] + 1;
}

function rangeMerge(a, b) {
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

function addRange(ranges, newRange) {
  let removeRanges = [];
  for (let rangeStr of ranges) {
    const range = rangeStr.split(',').map(Number);
    if (rangeTouches(newRange, range)) {
      removeRanges.push(range);
      newRange = rangeMerge(range, newRange);
    }
  }
  for (let removeRange of removeRanges) {
    ranges.delete(String(removeRange));
  }
  ranges.add(String(newRange));
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

  const emptyRanges = new Set();
  for (let line of input) {
    const radius = dist(line.sensor, line.beacon);
    const xRadius = radius - Math.abs(line.sensor[1] - yQuery);
    if (xRadius < 0) continue;
    if (yQuery == line.beacon[1]) {
      addRange(emptyRanges, [line.sensor[0] - xRadius, line.beacon[0] - 1]);
      addRange(emptyRanges, [line.beacon[0] + 1, line.sensor[0] + xRadius]);
    } else {
      addRange(emptyRanges, [line.sensor[0] - xRadius, line.sensor[0] + xRadius]);
    }
  }
  console.log(emptyRanges);
  console.log(Array.from(emptyRanges).map(rStr => {
    const r = rStr.split(',').map(Number);
    return r[1] - r[0] + 1;
  }).reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
