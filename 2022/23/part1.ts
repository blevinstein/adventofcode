
import fs from 'fs';

function checkSpaces(spaces) {
  return (elf, elfSet) => {
    for (let offset of spaces) {
      if (elfSet.has(String(add(elf, offset)))) {
        return false;
      }
    }
    return true;
  };
}

const firstMove = {
  check: checkSpaces([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1] ]),
  move: [0, 0],
  name: 'noop'
};
const rotatingMoves = [
  { check: checkSpaces([[-1, -1], [0, -1], [1, -1]]), move: [0, -1], name: 'N' },
  { check: checkSpaces([[-1, 1], [0, 1], [1, 1]]), move: [0, 1], name: 'S' },
  { check: checkSpaces([[-1, -1], [-1, 0], [-1, 1]]), move: [-1, 0], name: 'W' },
  { check: checkSpaces([[1, -1], [1, 0], [1, 1]]), move: [1, 0], name: 'E' },
];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function eq(a, b) {
  return a[0] == b[0] && a[1] == b[1];
}

function drawGrid(elves) {
  const minX = elves.map(e => e[0]).reduce((a, b) => Math.min(a, b));
  const maxX = elves.map(e => e[0]).reduce((a, b) => Math.max(a, b));
  const minY = elves.map(e => e[1]).reduce((a, b) => Math.min(a, b));
  const maxY = elves.map(e => e[1]).reduce((a, b) => Math.max(a, b));
  for (let y = minY; y <= maxY; ++y) {
    for (let x = minX; x <= maxX; ++x) {
      if (elves.find(e => eq(e, [x, y]))) {
        process.stdin.write('#');
      } else {
        process.stdin.write(' ');
      }
    }
    process.stdin.write('\n');
  }
  process.stdin.write('\n');
}

function emptyTiles(elves) {
  let emptyTileCount = 0;
  const minX = elves.map(e => e[0]).reduce((a, b) => Math.min(a, b));
  const maxX = elves.map(e => e[0]).reduce((a, b) => Math.max(a, b));
  const minY = elves.map(e => e[1]).reduce((a, b) => Math.min(a, b));
  const maxY = elves.map(e => e[1]).reduce((a, b) => Math.max(a, b));
  for (let y = minY; y <= maxY; ++y) {
    for (let x = minX; x <= maxX; ++x) {
      if (!elves.find(e => eq(e, [x, y]))) {
        emptyTileCount++;
      }
    }
  }
  return emptyTileCount;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString();
  let elves = rawInput.split('\n')
      .flatMap((line, y) => line.split('')
          .map((char, x) => [char, x])
          .filter(([char, x]) => char == '#')
          .map(([char, x]) => [x, y]));

  console.log('Initial state');
  drawGrid(elves);

  let elfSet = new Set(elves.map(String));
  let moveStart = 0;
  for (let round = 0; round < 10; ++round) {
    // Each elf chooses where it wants to move
    const moveMap = new Map;
    const moves = [firstMove].concat(
        rotatingMoves.slice(moveStart % rotatingMoves.length),
        rotatingMoves.slice(0, moveStart % rotatingMoves.length));
    //console.log(`Move order: ${moves.map(m => m.name)}`);
    for (let elf of elves) {
      for (let currentMove of moves) {
        if (currentMove.check(elf, elfSet)) {
          //console.log(`Elf at ${elf} moves ${currentMove.name}`);
          moveMap.set(String(elf), add(elf, currentMove.move));
          break;
        } else {
          //console.log(`Elf at ${elf} cannot move ${currentMove.name}`);
        }
      }
    }
    moveStart++;
    // Execute, but only if a single elf wants to move there
    elves = elves.map((elf) => {
      const move = moveMap.get(String(elf));
      if (!move) return elf;
      //console.log(moveMap.values());
      const moveCount = Array.from(moveMap.values()).filter(m => eq(m, move)).length;
      if (moveCount == 1) {
        return move;
      } else {
        //console.log(`Elf at ${elf} cannot move to ${move} due to conflicts (${moveCount})`);
        return elf;
      }
    });
    elfSet = new Set(elves.map(String));
    console.log(`After round ${round + 1}`);
    drawGrid(elves);
  }

  console.log(`Empty tiles: ${emptyTiles(elves)}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
