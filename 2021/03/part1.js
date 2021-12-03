
const fs = require('fs');

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();

  console.log(rawInput);

  const input = rawInput.split('\n')
      .filter(line => line.length > 0)
      .map(line => line.split('').map(v => v == '1' ? 1 : 0));

  const width = input[0].length;

  console.log(input);

  let gamma = [];
  let epsilon = [];
  for (let i = 0; i < width; ++i) {
    let sum = 0;
    for (let j = 0; j < input.length; ++j) {
      sum += input[j][i];
    }
    const mostCommon = Math.round(sum / input.length);
    gamma.push(mostCommon);
    epsilon.push((1 - mostCommon));
  }
  console.log(`gamma=${gamma} epsilon=${epsilon}`);
  gamma = parseInt(gamma.join(''), 2);
  epsilon = parseInt(epsilon.join(''), 2);
  console.log(`gamma=${gamma} epsilon=${epsilon}`);
  console.log(`product=${gamma * epsilon}`);
}

main();
