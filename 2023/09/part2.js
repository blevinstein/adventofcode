
import fs from 'fs';

function pairs(arr) {
  return arr.slice(1).map((item, i) => [arr[i], item]);
}

function predictLast(series) {
  const diffs = pairs(series).map(([a, b]) => b - a);
  if (diffs.every(n => n === 0)) {
    return series[0];
  }
  const lastDiff = predictLast(diffs);
  const lastElem = series[0] - lastDiff;
  //console.log({series, diffs, lastDiff, lastElem});
  return lastElem;
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/\s+/).map(s => Number(s)));
  const last = input.map(series => predictLast(series));
  console.log(last);
  console.log(last.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
