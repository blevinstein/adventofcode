
import fs from 'fs';

const rawRocks = `
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`.trim();

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();

  // Bottom left corner of each rock is [0, 0]
  const rocks = rawRocks.split('\n\n').map(rawRock => {
    const grid = rawRock.split('\n');
    return grid.flatMap((line, y) =>
        line.split('')
            // Get x coord before filtering
            .map((char, x) => [char, x])
            // Remove empty space
            .filter(([char, x]) => char == '#')
            // Return [x, y] coords, after inverting y
            .map(([char, x]) => [x, grid.length - y - 1]));
  });

  const maxX = 6;
  let scene = new Set();
  let maxY = -1;
  let tick = 0;

  function fits(rock, coord) {
    for (let part of rock) {
      const partCoord = add(part, coord);
      if (scene.has(String(partCoord)) ||
          partCoord[0] < 0 || partCoord[0] > maxX ||
          partCoord[1] < 0) {
        return false;
      }
    }
    return true;
  }

  function addRock(rock, coord) {
    for (let part of rock) {
      const partCoord = add(part, coord);
      scene.add(String(partCoord))
      if (partCoord[1] > maxY) {
        maxY = partCoord[1];
      }
    }
  }

  function visualGrid() {
    let result = '\n';
    for (let y = maxY; y >= 0; --y) {
      for (let x = 0; x <= maxX; ++x) {
        result += scene.has(String([x, y])) ? '#' : ' ';
      }
      result += '\n';
    }
    result += '-------\n';
    return result;
  }

  for (let i = 0; i < 2022; ++i) {
    const fallingRock = rocks[i % rocks.length];
    let x = 2;
    let y = maxY + 4;

    while (true) {
      // Lateral movement
      const jet = rawInput[tick++ % rawInput.length] == '>' ? 1 : -1;
      if (fits(fallingRock, [x + jet, y])) {
        x += jet;
      } else {
      }
      // Downward movement
      if (fits(fallingRock, [x, y - 1])) {
        y--;
      } else {
        addRock(fallingRock, [x, y]);
        break;
      }
    }
    //console.log(visualGrid());
    //console.log(scene);
  }
  console.log(maxY + 1);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
