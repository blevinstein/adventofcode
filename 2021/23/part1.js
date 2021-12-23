
const fs = require('fs');

const DEBUG = true;

const STACK_X = [2, 4, 6, 8];

// Height of bottom of stack
const STACK_Y = -2;

const STACK_GOAL = ['A', 'B', 'C', 'D'];

const ENERGY = new Map([
  ['A', 1],
  ['B', 10],
  ['C', 100],
  ['D', 1000],
]);

Array.prototype.spliced = function(...args) {
  const result = Array.from(this);
  result.splice(...args);
  return result;
}

Array.prototype.popped = function() {
  const result = Array.from(this);
  result.pop();
  return result;
}

function calcMinEnergy(stacks, buffer) {
  let result = 0;
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 2; ++j) {
      if (stacks[i].length < j || stacks[i][j] != STACK_GOAL[i]) {
        result += ENERGY.get(STACK_GOAL[i]);
      }
    }
  }
  for (let i = 0; i < buffer.length; ++i) {
    if (!buffer[i]) continue;
    result += ENERGY.get(buffer[i]) * Math.abs(i - STACK_X[STACK_GOAL.indexOf(buffer[i])]);
  }
  if (isNaN(result)) throw Error(`Bad result: ${result}`);
  return result;
}

function isClear(array, i, j) {
  for (let k = Math.min(i, j); k <= Math.max(i, j); ++k) {
    if (array[k] != null) return false;
  }
  return true;
}

function nextStates(state) {
  const {stacks, buffer} = state;
  const result = [];
  // Moving from hallway to goal
  for (let i = 0; i < 4; ++i) {
    if (stacks[i].length == 2) continue;
    if (stacks[i].find(elem => elem != STACK_GOAL[i])) continue;

    for (let j = 0; j < buffer.length; ++j) {
      if (buffer[j] != STACK_GOAL[i]) continue;
      if (j > STACK_X[i] ? isClear(buffer, STACK_X[i], j-1) : isClear(buffer, STACK_X[i], j+1)) {
        const character = buffer[j];
        const dist = 2 - stacks[i].length + Math.abs(j - STACK_X[i]);
        const newStacks = stacks.spliced(i, 1, stacks[i].concat(buffer[j]));
        const newEnergy = state.energy + dist * ENERGY.get(character);
        const newBuffer = buffer.spliced(j, 1, null);
        //console.log(`Move ${character} to stack ${i} dist=${dist}`);
        result.push({
          stacks: newStacks,
          buffer: newBuffer,
          energy: newEnergy,
          minEnergy: calcMinEnergy(newStacks, newBuffer) + newEnergy,
          previousState: state,
        });
      }
    }
  }
  // Moving from top of each stack to hallway positions
  for (let i = 0; i < 4; ++i) {
    if (stacks[i].length == 0) continue;

    for (let j = 0; j < buffer.length; ++j) {
      if (!STACK_X.includes(j) && isClear(buffer, STACK_X[i], j)) {
        const character = stacks[i][stacks[i].length - 1];
        const dist = 3 - stacks[i].length + Math.abs(j - STACK_X[i]);
        const newStacks = stacks.spliced(i, 1, stacks[i].popped());
        const newEnergy = state.energy + dist * ENERGY.get(character);
        const newBuffer = buffer.spliced(j, 1, character);
        //console.log(`Move ${character} from stack ${i} dist=${dist}`);
        result.push({
          stacks: newStacks,
          buffer: newBuffer,
          energy: newEnergy,
          minEnergy: calcMinEnergy(newStacks, newBuffer) + newEnergy,
          previousState: state,
        });
      }
    }
  }
  return result;
}

function keyOf(state) {
  return state.stacks.map(stack => '[' + stack.join(',') + ']').concat(state.buffer).join(',');
}

function insertState(states, newState) {
  if (states.length == 0) {
    states.splice(0, 0, newState);
    return;
  }
  // Binary search
  let min = 0;
  let max = states.length;
  while (max - min > 1) {
    const mid = Math.floor((max + min) / 2);
    if (states[mid].minEnergy > newState.minEnergy) {
      min = mid;
    } else {
      max = mid;
    }
  }
  if (states[min].minEnergy > newState.minEnergy) {
    states.splice(min + 1, 0, newState);
  } else {
    states.splice(min, 0, newState);
  }
}

function showState(state) {
  console.log(state.buffer.map(c => c || '.').join(''));
  console.log('  ' + (state.stacks[0][1] || ' ') + '.' + (state.stacks[1][1] || ' ') + '.' + (state.stacks[2][1] || ' ') + '.' + (state.stacks[3][1] || ' '));
  console.log('  ' + (state.stacks[0][0] || ' ') + '.' + (state.stacks[1][0] || ' ') + '.' + (state.stacks[2][0] || ' ') + '.' + (state.stacks[3][0] || ' '));
  console.log(`energy=${state.energy} minEnergy=${state.minEnergy}`);
  console.log('');
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .slice(2, 4)
      .map(line => [line[3], line[5], line[7], line[9]]);
  let stacks = [];
  for (let i = 0; i < 4; ++i) {
    stacks.push([]);
    for (let j = 0; j < input.length; ++j) {
      stacks[i].splice(0, 0, input[j][i]);
    }
  }
  let buffer = [];
  for (let i = 0; i < 11; ++i) { buffer.push(null); };

  let initialState = {
    stacks,
    buffer,
    minEnergy: calcMinEnergy(stacks, buffer),
    energy: 0,
  };
  let states = [initialState];
  //const seenStateEnergy = new Map;
  const seenStates = new Set;

  /*
  for (let i = 0; i < 2; ++i) {
    states = states.flatMap(state => nextStates(state));
  }
  for (let state of states) {
    showState(state);
  }
  return;
  */

  /*
  for (let nextState of nextStates(initialState)) {
    showState(nextState);
  }
  return;
  */

  while (states.length > 0) {
    const currentState = states.pop();

    const stateKey = keyOf(currentState);
    /*
    if (seenStateEnergy.get(stateKey) < currentState.energy) continue;
    seenStateEnergy.set(stateKey, currentState.energy);
    */
    if (seenStates.has(stateKey)) continue;
    seenStates.add(stateKey);

    //console.log(states);
    //console.log(currentState);

    if (currentState.minEnergy - currentState.energy == 0) {
      console.log(`Complete. Energy used: ${currentState.energy}`);
      /*
      let historyState = currentState;
      while (historyState != undefined) {
        showState(historyState);
        historyState = historyState.previousState;
      }
      */
      return;
    } else {
      for (let nextState of nextStates(currentState)) {
        insertState(states, nextState);
      }
    }
  }

  console.log('Done');
}

main();
