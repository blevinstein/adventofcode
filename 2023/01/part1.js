
import fs from 'fs';

async function main() {
  const lines = fs.readFileSync(process.argv[2]).toString().trim().split('\n');
  const isDigit = (c) => c.match(/\d/);
  console.log(lines.map(line =>
          Number(Array.from(line).find(isDigit)
              + Array.from(line).findLast(isDigit)))
      .reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
