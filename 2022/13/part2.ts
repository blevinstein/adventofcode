
import fs from 'fs';
import { lessThan } from './common';

function eq(a, b) {
  return !lessThan(a, b) && !lessThan(b, a);
}

async function main() {
  const dividerPackets = [[[2]], [[6]]];
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  let packets = rawInput.split('\n\n').flatMap(pair => {
    const [leftStr, rightStr] = pair.split('\n');
    return [JSON.parse(leftStr), JSON.parse(rightStr)];
  }).concat(dividerPackets);

  packets.sort((a, b) => lessThan(a, b) ? -1 : 1);

  console.log(packets);
  console.log(dividerPackets
    .map(divider => packets.findIndex(p => eq(p, divider)) + 1)
    .reduce((a, b) => a * b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
