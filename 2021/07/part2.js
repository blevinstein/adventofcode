
const fs = require('fs');

async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split(',')
      .map(s => parseInt(s));

  const average = input.reduce((a, b) => a + b) / input.length;
  const options = [Math.floor(average), Math.ceil(average)];
  const totalFunc = (option) => input.map(v => {
    const n = Math.abs(v - option);
    return n * (n + 1) / 2;
  }).reduce((a, b) => a + b);
  const totals = options.map(totalFunc);
  const [target, total] = totals[0] < totals[1]
      ? [options[0], totals[0]]
      : [options[1], totals[1]];
  console.log(`target=${target} total=${total}`);
}

main();
