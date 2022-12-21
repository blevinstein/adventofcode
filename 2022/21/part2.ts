
import fs from 'fs';

const functions = {
  '*': (a, b) => a * b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
};

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const monkeys = new Map(rawInput.split('\n').map(line => {
    const [name, equation] = line.split(': ');
    if (/\d+/.exec(equation)) {
      return [name, { value: Number(equation) }];
    } else {
      const [_, a, operator, b] = /(\w+) ([*+-/]) (\w+)/.exec(equation);
      return [name, { a, operator, b }];
    }
  }));

  // Returns true if the subtree rooted at `monkeyName` contains `humn`
  function containsHuman(monkeyName) {
    if (monkeyName == 'humn') return true;
    const monkey = monkeys.get(monkeyName);
    if (monkey.value) return false;
    return containsHuman(monkey.a) || containsHuman(monkey.b);
  }

  function evaluate(goalName, humn) {
    //console.log(`evaluate ${goalName} humn=${humn}`);
    if (goalName == 'humn') {
      if (humn !== undefined) return humn;
      throw Error('Cannot evaluate a tree containing `humn` when not speciifed');
    }
    const monkey = monkeys.get(goalName);
    if (monkey.value) {
      //console.log(`${goalName}: ${monkey.value}`);
      return monkey.value;
    } else {
      const value = functions[monkey.operator](evaluate(monkey.a, humn), evaluate(monkey.b, humn));
      //console.log(`${goalName}: ${value}`);
      return value;
    }
  }

  // Returns the value of `humn` that makes monkey `goalName` shout `value`
  function solve(goalName, value) {
    //console.log(`solve ${goalName} = ${value}`);
    if (!value) throw new Error(`Cannot solve for value ${value}`);
    if (goalName == 'humn') return value;
    const monkey = monkeys.get(goalName);

    if (containsHuman(monkey.a) && containsHuman(monkey.b)) {
      throw new Error('Assumption violated, this is not a tree');
    }

    let result;
    if (containsHuman(monkey.a)) {
      switch (monkey.operator) {
        case '*': result = solve(monkey.a, value / evaluate(monkey.b)); break;
        case '/': result = solve(monkey.a, value * evaluate(monkey.b)); break;
        case '+': result = solve(monkey.a, value - evaluate(monkey.b)); break;
        case '-': result = solve(monkey.a, value + evaluate(monkey.b)); break;
        default: throw new Error(`Unexpected operator ${monkey.operator}`);
      }
    } else if (containsHuman(monkey.b)) {
      switch (monkey.operator) {
        case '*': result = solve(monkey.b, value / evaluate(monkey.a)); break;
        case '/': result = solve(monkey.b, evaluate(monkey.a) / value); break;
        case '+': result = solve(monkey.b, value - evaluate(monkey.a)); break;
        case '-': result = solve(monkey.b, evaluate(monkey.a) - value); break;
        default: throw new Error(`Unexpected operator ${monkey.operator}`);
      }
    } else {
      throw new Error('Cannot solve a tree not containing `humn`');
    }
    // Sanity check
    if (!result) throw new Error(`No result computed ${goalName} ${JSON.stringify(monkey)}`);
    if (evaluate(goalName, result) != value) {
      throw new Error(`Solve failed at ${goalName} goal ${value} result ${result} monkey ${JSON.stringify(monkey)}`);
    }
    return result;
  }

  const root = monkeys.get('root');
  let result;
  console.log(`Solving...`);
  if (containsHuman(root.a)) {
    result = solve(root.a, evaluate(root.b));
  } else {
    result = solve(root.b, evaluate(root.a));
  }
  console.log(`Result: ${result}`);
  console.log(`Check: ${evaluate(root.a, result)} = ${evaluate(root.b, result)}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
