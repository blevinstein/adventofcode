
import fs from 'fs';

const vectors = [
  [1, 0], // right
  [0, 1], // down
  [-1, 0], // left
  [0, -1], // up
];

const characters = [ '>', 'v', '<', '^' ];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function parseMoves(rawMoves) {
  let remainder = rawMoves.trim();
  let moves = [];
  while (remainder.length > 0) {
    if (remainder[0] == 'L' || remainder[0] == 'R') {
      moves.push(remainder[0]);
      remainder = remainder.slice(1);
    } else {
      const [numString] = /^\d+/.exec(remainder);
      remainder = remainder.slice(numString.length);
      moves.push(Number(numString));
    }
  }
  return moves;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString();
  const [rawGrid, rawMoves] = rawInput.split('\n\n');

  const height = rawGrid.split('\n').length;
  const width = rawGrid.split('\n').map(line => line.length).reduce((a, b) => Math.max(a, b));

  const grid = new Map(rawGrid.split('\n').flatMap((line, y) =>
    line.split('').map((char, x) => [char, x])
        .filter(([char, x]) => char != ' ')
        .map(([char, x]) => [String([x, y]), char])
  ));

  const moves = parseMoves(rawMoves);

  // Moves one unit forward. If this results in leaving the grid, it returns the wrapped location on
  // the other side of the grid.
  function moveForward(position, direction) {
    let vector = vectors[direction];
    let newPosition = add(position, vector);
    if (!grid.has(String(newPosition))) {
      // Wrap
      newPosition = direction % 2 == 0
          // left or right
          ? [position[0] - vector[0] * width, position[1]]
          // up or down
          : [position[0], position[1] - vector[1] * height];
      // Move until we find the grid again
      while (!grid.has(String(newPosition))) {
        newPosition = add(newPosition, vector);
      }
    }
    return newPosition;
  }

  let position = [0, 0];
  let direction = 0;
  while (!grid.has(String(position))) {
    position = [position[0] + 1, 0];
  }
  let path = new Map([[String(position), characters[direction]]]);
  for (let move of moves) {
    if (typeof move == 'number') {
      for (let i = 0; i < move; ++i) {
        const nextPosition = moveForward(position, direction);
        if (grid.get(String(nextPosition)) == '.') {
          position = nextPosition;
          path.set(String(position), characters[direction]);
        } else {
          break;
        }
      }
    } else if (move == 'R') {
      direction = (direction + 1) % 4; // Turn right
    } else {
      direction = (direction + 3) % 4; // Turn left
    }
    path.set(String(position), characters[direction]);
  }

  function drawGrid() {
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (path.has(String([x,y]))) {
          process.stdout.write(path.get(String([x,y])));
        } else if (grid.has(String([x,y]))) {
          process.stdout.write('.');
        } else {
          process.stdout.write(' ');
        }
      }
      process.stdout.write('\n');
    }
  }
  drawGrid();

  console.log((position[0] + 1) * 4 + (position[1] + 1) * 1000 + direction);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
