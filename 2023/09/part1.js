
import fs from 'fs';

function pairs(arr) {
  return arr.slice(1).map((item, i) => [arr[i], item]);
}

function predict(series) {
  const diffs = pairs(series).map(([a, b]) => b - a);
  if (diffs.every(n => n === 0)) {
    return series[0];
  }
  const nextDiff = predict(diffs);
  const nextElem = series[series.length - 1] + nextDiff;
  //console.log({series, diffs, nextDiff, nextElem});
  return nextElem;
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/\s+/).map(s => Number(s)));
  const next = input.map(series => predict(series));
  console.log(next);
  console.log(next.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
