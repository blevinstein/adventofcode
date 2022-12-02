
import fs from 'fs';

enum Move {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

const ParseOne = {
  A: Move.Rock,
  B: Move.Paper,
  C: Move.Scissors,
};

const ParseTwo = {
  X: Move.Rock,
  Y: Move.Paper,
  Z: Move.Scissors,
};

function wins(move: Move, otherMove: Move) {
  return (move == Move.Rock && otherMove == Move.Scissors) ||
      (move == Move.Scissors && otherMove == Move.Paper) ||
      (move == Move.Paper && otherMove == Move.Rock);
}

function ties(move: Move, otherMove: Move) {
  return !wins(move, otherMove) && !wins(otherMove, move);
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input: string[][] = rawInput.split('\n').map(line => line.split(' '));
  const scores: number[] = input.map((line: string[]) => {
    const otherMove = ParseOne[line[0]];
    const move = ParseTwo[line[1]];
    console.log(`${move} vs ${otherMove}`);
    if (wins(move, otherMove)) {
      return 6 + move;
    } else if (ties(move, otherMove)) {
      return 3 + move;
    } else {
      return move;
    }
  });
  const totalScore: number = scores.reduce((a, b) => a + b, 0);
  console.log(`Score: ${totalScore} [${scores}]`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
