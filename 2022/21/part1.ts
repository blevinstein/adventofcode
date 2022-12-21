
import fs from 'fs';

function interruptableWhile(condition, innerBlock) {
  return new Promise(async (resolve, reject) => {
    async function cycle() {
      if (await condition()) {
        await innerBlock();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    await cycle();
  });
}

const functions = {
  '*': (a, b) => a * b,
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
};

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const monkeys = rawInput.split('\n').map(line => {
    const [name, equation] = line.split(': ');
    if (/\d+/.exec(equation)) {
      return { name, value: Number(equation) };
    } else {
      const [_, a, operator, b] = /(\w+) ([*+-/]) (\w+)/.exec(equation);
      return { name, a, operator, b };
    }
  });

  let monkeyValues = new Map;
  let done = false;
  await interruptableWhile(() => !done, () => {
    done = true;
    for (let monkey of monkeys) {
      if (monkeyValues.has(monkey.name)) continue;
      if (monkey.value) {
        monkeyValues.set(monkey.name, monkey.value);
        console.log(`${monkey.name}: ${monkey.value}`);
      } else if (monkeyValues.has(monkey.a) && monkeyValues.has(monkey.b)) {
        const value = functions[monkey.operator](monkeyValues.get(monkey.a), monkeyValues.get(monkey.b));
        monkeyValues.set(monkey.name, value);
        console.log(`${monkey.name}: ${monkey.a} ${monkey.operator} ${monkey.b} = ${value}`);
      } else {
        done = false;
      }
    }
  });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
