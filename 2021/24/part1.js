
const fs = require('fs');
const PriorityQueue = require('js-priority-queue');

const DEBUG = true;

const OFFSET_MAP = new Map([
  [5, -10],
  [7, -9],
  [8, -3],
  [10, -5],
  [11, -10],
  [12, -4],
  [13, -5]
]);

function splitZ(z) {
  if (z < 26) {
    return [z];
  }
  return splitZ(Math.floor(z/26)).concat(z%26);
}

function runProgram(instructions, input, state = {w: 0, x: 0, y: 0, z: 0}) {
  state = state || {};
  state.w = state.w || 0;
  state.x = state.x || 0;
  state.y = state.y || 0;
  state.z = state.z || 0;

  function getB(value) {
    return /^(-?\d+)$/.exec(value) ? parseInt(value) : state[value];
  }

  for (let step of instructions) {
    switch(step[0]) {
      case 'inp':
        if (input.length == 0) throw Error('Out of input');
        state[step[1]] = input.splice(0, 1)[0];
        break;
      case 'add':
        state[step[1]] = state[step[1]] + getB(step[2]);
        break;
      case 'mul':
        state[step[1]] = state[step[1]] * getB(step[2]);
        break;
      case 'div':
        state[step[1]] = Math.floor(state[step[1]] / getB(step[2]));
        break;
      case 'mod':
        state[step[1]] = state[step[1]] % getB(step[2]);
        break;
      case 'eql':
        state[step[1]] = state[step[1]] == getB(step[2]) ? 1 : 0;
        break;
      default:
        throw Error(`Bad instruction: ${step}`);
    }
  }

  return state;
}

function digitsOf(number) {
  if (number < 0) throw Error(`Invalid input: ${number}`);
  if (number < 10) {
    return [number];
  }
  return digitsOf(Math.floor(number / 10)).concat(number % 10);
}

async function main() {
  let instructions = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => line.split(' '));

  const states = new PriorityQueue({ comparator: (a, b) => {
    if (a.digits.length != b.digits.length) {
      // Prefer more digits
      return b.digits.length - a.digits.length;
    } else {
      // Prefer higher digit value
      return parseInt(b.digits.join('')) - parseInt(a.digits.join(''));
    }
  }});

  const allValid = [];
  //const seenDigitZs = new Set;
  //let step = 0;

  states.queue({digits: [], z: 0});
  while (states.length > 0) {
    const {digits, z} = states.dequeue();

    /*
    if (step++ % 1000000 == 0) {
      console.log(`States: ${states.length}`);
      console.log(`Valid so far: ${allValid.join(',')}`);
    }
    */

    /*
    const digitZ = [digits.length, z].join(',');
    if (seenDigitZs.has(digitZ)) {
      //console.log(`Short circuit ${digitZ}`);
      continue;
    }
    seenDigitZs.add(digitZ);
    */

    if (digits.length == 14) {
      if (z == 0) {
        console.log(`Success: ${digits.join('')} => ${z}`);
        allValid.push(digits.join(''));
        return;
      }
      continue;
    }

    if (OFFSET_MAP.has(digits.length)) {
      const nextDigit = (z % 26) + OFFSET_MAP.get(digits.length);
      if (nextDigit < 1 || nextDigit > 9) continue;
      const nextState = runProgram(instructions.slice(digits.length*18, (digits.length+1)*18), [nextDigit], {z});
      states.queue({digits: digits.concat(nextDigit), z: nextState.z});
    } else {
      for (let nextDigit of [9, 8, 7, 6, 5, 4, 3, 2, 1]) {
        const nextState = runProgram(instructions.slice(digits.length*18, (digits.length+1)*18), [nextDigit], {z});
        states.queue({digits: digits.concat(nextDigit), z: nextState.z});
      }
    }
  }

  console.log('Done');
}

main();
