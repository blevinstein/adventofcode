
import fs from 'fs';

const LIMIT = {
  red: 12,
  green: 13,
  blue: 14,
};

async function main() {
  const games = fs.readFileSync(process.argv[2]).toString().trim().split('\n');
  let result = 0;
  for (let game of games) {
    const [ _, numString, details ] = game.match(/Game (\d+): (.*)/);
    const parts = details.split(/[;,]\s*/);
    if (parts
        .map(p => p.split(' '))
        .every(([amount, color]) => Number(amount) <= LIMIT[color])) {
      result += Number(numString);
    }
  }
  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
