
const fs = require('fs');

const DEBUG = false;

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim();
  let match = /target area: x=(-?\d+)\.\.(-?\d+), y=(-?\d+)\.\.(-?\d+)/.exec(input);
  const minX = parseInt(match[1]);
  const maxX = parseInt(match[2]);
  const minY = parseInt(match[3]);
  const maxY = parseInt(match[4]);

  let initY = 0;
  while (true) {
    let vy = initY;
    let y = 0;
    let maxHeight = 0;
    while (y > minY) {
      y += vy;
      vy--;
      if (y > maxHeight) maxHeight = y;
      if (minY <= y && y <= maxY) {
        console.log(`${initY} => ${maxHeight}`);
        break;
      }
    }
    initY++;
  }
}

main();
