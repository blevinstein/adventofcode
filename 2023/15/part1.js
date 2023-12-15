
import fs from 'fs';

function hash(string) {
  let value = 0;
  for (let c of string) {
    value = (value + c.charCodeAt(0)) * 17 % 256;
  }
  return value;
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString().trim().split(',');
  console.log(rawInput.map(part => hash(part)).reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
