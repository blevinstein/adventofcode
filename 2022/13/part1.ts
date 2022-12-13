
import fs from 'fs';
import { lessThan } from './common';

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const pairs = rawInput.split('\n\n').map(pair => {
    const [leftStr, rightStr] = pair.split('\n');
    return [JSON.parse(leftStr), JSON.parse(rightStr)];
  });
  let total = 0;
  for (let i = 0; i < pairs.length; ++i) {
    const [left, right] = pairs[i];
    if (!lessThan(left, right)) {
      console.log(`Out of order: ${JSON.stringify(left)} >= ${JSON.stringify(right)} (${i+1})`);
    } else {
      total += i + 1;
      console.log(`In order: ${JSON.stringify(left)} < ${JSON.stringify(right)}`);
    }
  }
  console.log(total);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
