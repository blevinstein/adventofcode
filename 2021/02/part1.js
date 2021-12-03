
const fs = require('fs');

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();
  const input = rawInput.split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        let [dir, amount] = line.split(' ');
        amount = parseInt(amount);
        return {dir, amount};
      });
  let position = 0;
  let depth = 0;
  for (let {dir, amount} of input) {
    if (dir == 'forward') {
      position += amount;
    } else if (dir == 'up') {
      depth -= amount;
    } else if (dir == 'down') {
      depth += amount;
    } else {
      throw Error(`Invalid direction: ${dir}`);
    }
  }
  console.log(`position=${position} depth=${depth}`);
}

main();
