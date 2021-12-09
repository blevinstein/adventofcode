
const fs = require('fs');

async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split(',')
      .map(s => parseInt(s));

  input.sort((a, b) => a > b ? 1 : -1);

  const half = Math.floor(input.length / 2);
  const median = input.length % 2 == 1 ?
      input[half] :
      Math.floor((input[half] + input[half - 1]) / 2);
  const total = input.map(v => Math.abs(v - median)).reduce((a, b) => a + b);

  console.log(`target=${median} total=${total}`);
}

main();
