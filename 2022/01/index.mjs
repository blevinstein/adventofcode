
import fs from 'fs';

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString().trim();
  const sum = list => list.reduce((x, y) => x + y, 0);
  const input = rawInput.split('\n\n').map(chunk => chunk.split('\n').map(s => Number(s)));
  let totals = input.map(list => sum(list));
  totals.sort((a, b) => b - a);
  console.log(totals[0]);
  console.log(totals[0] + totals[1] + totals[2]);
}

main().then(() => console.log('Done')).catch(e => console.error(e));
