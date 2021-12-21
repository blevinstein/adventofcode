
const fs = require('fs');

const DEBUG = true;

let nextDie = 1;
function die() {
  return nextDie++;
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => {
        const parts = line.split(' ');
        return parseInt(parts[parts.length - 1]);
      });

  const positions = input;
  const scores = [0, 0];
  let rolls = 0;
  let player = 0;
  while (scores[0] < 1000 && scores[1] < 1000) {
    const move = [die(), die(), die()].reduce((a, b) => a + b);
    rolls += 3;
    const newPosition = (positions[player] - 1 + move) % 10 + 1;
    scores[player] += newPosition;
    console.log(`Player ${player + 1} moves to space ${newPosition}, score=${scores[player]}`);
    positions[player] = newPosition;
    player = 1 - player;
  }

  console.log(`Losing player score=${scores[player]}, rolls=${rolls}, product=${scores[player] * rolls}`);

  console.log('Done');
}

main();
