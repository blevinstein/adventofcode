
const fs = require('fs');

const DEBUG = true;

function keyOf(state) {
  if (state.scores.length != 2
      || state.positions.length != 2
      || state.positions.find(p => isNaN(p))
      || state.scores.find(s => isNaN(s))) {
    throw Error(`Bad state: ${JSON.stringify(state)}`);
  }
  return state.positions.concat(state.scores).join(',');
}

function stateOf(key) {
  const [positionA, positionB, scoreA, scoreB] =
      key.split(',').map(s => parseInt(s));
  return {
    positions: [positionA, positionB],
    scores: [scoreA, scoreB],
  };
}

function threeRolls() {
  const result = new Map;
  for (let i of [1,2,3])
    for (let j of [1,2,3])
      for (let k of [1,2,3])
        result.set(i+j+k, (result.get(i+j+k) || 0) + 1);
  return result;
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(line => {
        const parts = line.split(' ');
        return parseInt(parts[parts.length - 1]);
      });

  const ROLL = threeRolls();

  let states = new Map;
  states.set(keyOf({positions: input, scores: [0, 0]}), 1);

  let wins = [0, 0];
  let player = 0;
  while (states.size > 0) {
    const newStates = new Map;
    for (let [key, count] of states.entries()) {
      const {positions, scores} = stateOf(key);
      for (let [roll, rollCount] of ROLL) {
        const newPosition = (positions[player] - 1 + roll) % 10 + 1;
        const newScore = scores[player] + newPosition;
        //console.log(`Player ${player + 1} rolls ${roll} moves to space ${newPosition} score ${newScore} in ${count * rollCount} universes`);
        if (newScore >= 21) {
          wins[player] += count * rollCount;
        } else {
          const newPositions = Array.from(positions);
          newPositions.splice(player, 1, newPosition);
          const newScores = Array.from(scores);
          newScores.splice(player, 1, newScore);

          const newKey = keyOf({
            positions: newPositions,
            scores: newScores,
          });
          newStates.set(newKey, (newStates.get(newKey) || 0) + count * rollCount);
        }
      }
    }
    states = newStates;
    player = 1 - player;
  }

  console.log(wins);

  console.log('Done');
}

main();
