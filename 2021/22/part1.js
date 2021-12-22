
const fs = require('fs');

const DEBUG = true;

function keyOf(position) {
  return position.join(',');
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => {
        const match = /(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)/.exec(line);
        return {
          state: match[1],
          x: [parseInt(match[2]), parseInt(match[3])],
          y: [parseInt(match[4]), parseInt(match[5])],
          z: [parseInt(match[6]), parseInt(match[7])],
        };
      });

  console.log(input);

  const state = new Set;
  for (let step of input) {
    console.log(step);
    for (let x = Math.max(-50, step.x[0]); x <= Math.min(step.x[1], 50); x++) {
      for (let y = Math.max(-50, step.y[0]); y <= Math.min(step.y[1], 50); y++) {
        for (let z = Math.max(-50, step.z[0]); z <= Math.min(step.z[1], 50); z++) {
          const key = keyOf([x,y,z]);
          if (step.state == 'on') {
            state.add(key);
          } else {
            state.delete(key);
          }
        }
      }
    }
  }
  console.log(state.size);

  /*
  for (let x = -50; x <= 50; ++x) {
    for (let y = -50; y <= 50; ++y) {
      for (let z = -50; z <= 50; ++z) {
      }
    }
  }
  */

  console.log('Done');
}

main();
