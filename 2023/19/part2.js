
import fs from 'fs';

function countCombinations(input) {
  if (Array.from('xmas').some(c => input[c][1] < input[c][0])) throw Error('Invalid range');

  return Array.from('xmas')
      .map(c => input[c][1] - input[c][0] + 1)
      .reduce((a, b) => a * b);
}

function copyInput(input) {
  return Object.fromEntries(Object.entries(input).map(([k, [min, max]]) => [k, [min, max]]));
}

function acceptedCombinations(workflows, currentState, input) {
  if (currentState === 'R') return 0;
  if (currentState === 'A') return countCombinations(input);

  console.log({ currentState, input });

  let remainingInput = copyInput(input); // Defensive copy
  let result = 0;
  for (let { value, operation, number, state } of workflows[currentState]) {
    if (!operation) {
      result += acceptedCombinations(workflows, state, remainingInput);
    } else if (operation === '>' && remainingInput[value][1] > number) {
      const newInput = copyInput(remainingInput);
      newInput[value][0] = Math.max(remainingInput[value][0], number + 1);
      result += acceptedCombinations(workflows, state, newInput);
      remainingInput[value][1] = number;
    } else if (operation === '<' && remainingInput[value][0] < number) {
      const newInput = copyInput(remainingInput);
      newInput[value][1] = Math.min(remainingInput[value][1], number - 1);
      result += acceptedCombinations(workflows, state, newInput);
      remainingInput[value][0] = number;
    }
    if (operation && remainingInput[value][1] < remainingInput[value][0]) break;
  }
  return result;
}

async function main() {
  const [ rawWorkflows, rawInputs ] = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n');
  const workflows = Object.fromEntries(rawWorkflows.split('\n').map(line => {
    const [name, rawRules] = line.match(/([a-z]+){(.*)}/).slice(1);
    const rules = rawRules.split(',').map(rawRule => {
      if (rawRule.indexOf(':') >= 0) {
        const [ value, operation, number, state ] = rawRule.match(/([a-z]+)([<>])(\d+):([a-zA-Z]+)/).slice(1);
        return { value, operation, number: Number(number), state };
      } else {
        return { state: rawRule };
      }
    });
    return [ name, rules ];
  }));

  console.log(workflows);

  const input = {
    x: [1, 4000],
    m: [1, 4000],
    a: [1, 4000],
    s: [1, 4000],
  };

  //console.log(countCombinations(input));

  console.log(acceptedCombinations(workflows, 'in', input));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
