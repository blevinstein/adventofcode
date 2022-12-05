
import fs from 'fs';

type Section = [number, number];
type Pair = [Section, Section];

function contains(a: Pair, b: Pair) {
  return a[0] <= b[0] && a[1] >= b[1];
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const pairs: Pair[] = rawInput.split('\n').map(line => {
    const parts = line.split(/[-,]/).map(Number);
    return [[parts[0], parts[1]], [parts[2], parts[3]]];
  });
  const count: number = pairs.filter(pair => contains(pair[0], pair[1]) || contains(pair[1], pair[0])).length;
  console.log(count);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
