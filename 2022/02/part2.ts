
import fs from 'fs';

enum Move {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

enum Goal {
  Win = 1,
  Lose,
  Draw
}

const ParseOne = {
  A: Move.Rock,
  B: Move.Paper,
  C: Move.Scissors,
};

const ParseTwo = {
  X: Goal.Lose,
  Y: Goal.Draw,
  Z: Goal.Win,
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
    const goal = ParseTwo[line[1]];
    for (const move of [Move.Rock, Move.Paper, Move.Scissors]) {
      if (goal == Goal.Win && wins(move, otherMove)) {
        return 6 + move;
      } else if (goal == Goal.Draw && ties(move, otherMove)) {
        return 3 + move;
      } else if (goal == Goal.Lose && wins(otherMove, move)) {
        return move;
      }
    }
    throw Error('Unexpected state');
  });
  const totalScore: number = scores.reduce((a, b) => a + b, 0);
  console.log(`Score: ${totalScore} [${scores}]`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
