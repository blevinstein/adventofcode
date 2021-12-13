
const fs = require('fs');

function key(r, c) {
  return `${r},${c}`;
}

function show(dots) {
  const set = new Set(dots.map(coords => key(...coords)));
  const maxX = Math.max(...dots.map(dot => dot[0]));
  const maxY = Math.max(...dots.map(dot => dot[1]));
  for (let r = 0; r < maxY; ++r) {
    for (let c = 0; c < maxX; ++c) {
      process.stdout.write(set.has(key(c, r)) ? '#' : '.');
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
}

const DEBUG = false;

async function main() {
  const [inputDots, inputFolds] = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n\n');

  const dots = inputDots.split('\n')
      .map(line => line.split(',').map(s => parseInt(s)));
  const fold = [inputFolds.split('\n')[0]].map(s => {
    const match = /fold along (\w)=(\d+)/.exec(s);
    return [match[1], parseInt(match[2])];
  })[0];

  const newDots = dots.map(dot => {
    if (fold[0] == 'x') {
      return [
          dot[0] > fold[1] ? 2 * fold[1] - dot[0] : dot[0],
          dot[1]
      ];
    } else {
      return [
          dot[0],
          dot[1] > fold[1] ? 2 * fold[1] - dot[1] : dot[1]
      ];
    }
  });

  const set = new Set(newDots.map(coords => key(...coords)));

  if (DEBUG) {
    show(dots);
    show(newDots);
  }

  console.log(`Dots=${set.size}`);
}

main();
