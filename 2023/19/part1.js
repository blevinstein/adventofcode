
import fs from 'fs';

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
  const inputs = rawInputs.split('\n').map(line =>
      Object.fromEntries(line.match(/{(.*)}/)[1].split(',')
          .map(rawAttribute => {
            const [ key, str ] = rawAttribute.match(/(\w+)=(\d+)/).slice(1)
            return [ key, Number(str) ];
          })));

  console.log(workflows);
  console.log(inputs);

  let total = 0;
  for (let input of inputs) {
    let currentState = 'in';
    while (!['R', 'A'].includes(currentState)) {
      let newState;
      for (let { value, operation, number, state } of workflows[currentState]) {
        if (!operation) {
          newState = state;
          break;
        } else if (operation === '>') {
          if (input[value] > number) {
            newState = state;
            break;
          }
        } else if (operation === '<') {
          if (input[value] < number) {
            newState = state;
            break;
          }
        }
      }
      if (!newState) throw Error(`Workflow failed: ${workflow} on input ${input}`);
      currentState = newState;
    }
    if (currentState === 'A') {
      total += input.x + input.m + input.a + input.s;
    }
  }
  console.log({ total });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
