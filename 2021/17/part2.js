
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

  let count = 0;
  for (let initX = 0; initX <= maxX; ++initX) {
    for (let initY = minY; initY < 68; ++initY) {
      let vx = initX;
      let vy = initY;
      let x = 0;
      let y = 0;
      while (y >= minY && x <= maxX) {
        x += vx;
        y += vy;
        if (vx > 0) {
          vx--;
        } else if (vx < 0) {
          vx++;
        }
        vy--;
        if (minY <= y && y <= maxY && minX <= x && x <= maxX) {
          count++;
          break;
        }
      }
    }
  }

  console.log(count);
}

main();
