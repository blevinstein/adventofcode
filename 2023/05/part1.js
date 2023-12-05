
import fs from 'fs';

function applyMap(value, map) {
  for (let [destStart, sourceStart, rangeLength] of map) {
    if (value >= sourceStart && value < sourceStart + rangeLength) {
      return destStart + (value - sourceStart);
    }
  }
  return value;
}

async function main() {
  const parts = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n');
  const seeds = parts[0].split(': ')[1].split(' ').map(s => Number(s));
  const maps = parts.slice(1).map(part => part.split('\n').slice(1).map(line => line.split(' ').map(s => Number(s))));
  const results = seeds.map(seed => [seed, maps.reduce(applyMap, seed)]).sort((a, b) => a[1] - b[1]);
  console.log({ results });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
