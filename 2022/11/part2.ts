
import fs from 'fs';

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const monkeyInputs = rawInput.split('\n\n');
  const monkeys = monkeyInputs.map(input => {
    const lines = input.split('\n');
    const [_1, monkeyNumString] = /Monkey (\d+):/.exec(lines[0]);
    const monkeyNum = Number(monkeyNumString);
    const items = lines[1].split(': ')[1].split(', ').map(n => Number(n));
    const [_2, a, operator, b] = /\s*Operation: new = (\w+) ([*+]) (\w+)/.exec(lines[2]);
    const [_3, divisor] = /\s*Test: divisible by (\d+)/.exec(lines[3]);
    const [_4, trueDest] = /\s*If true: throw to monkey (\d+)/.exec(lines[4]);
    const [_5, falseDest] = /\s*If false: throw to monkey (\d+)/.exec(lines[5]);
    return {monkeyNum, items, a, operator, b, divisor, trueDest, falseDest, inspections: 0};
  });

  const maxValue = monkeys.map(m => m.divisor).reduce((a, b) => a * b);
  console.log(`Max value: ${maxValue}`);

  for (let round = 0; round < 10000; ++round) {
    if (round > 0 && (round == 1 || round == 20 || round % 1000 == 0)) {
      console.log(`After round ${round}:`);
      for (let monkey of monkeys) {
        console.log(`Monkey ${monkey.monkeyNum} inspected items ${monkey.inspections} times.`);
      }
    }
    for (let monkey of monkeys) {
      //console.log('Monkey ' + monkey.monkeyNum);
      while (monkey.items.length > 0) {
        let worry = monkey.items.shift();
        monkey.inspections++;
        //console.log(` Monkey inspects an item with a worry level of ${worry}`);
        const aValue = monkey.a == 'old' ? worry : Number(monkey.a);
        const bValue = monkey.b == 'old' ? worry : Number(monkey.b);
        worry = monkey.operator == '*' ? aValue * bValue : aValue + bValue;
        worry = worry % maxValue;

        if (!isFinite(worry)) throw Error("infinite worry");

        //console.log(`  Worry increases to ${worry}`);
        const dest = worry % monkey.divisor == 0 ? monkey.trueDest : monkey.falseDest;
        //console.log(`  Item of worry ${worry} thrown to ${dest}`);
        monkeys[dest].items.push(worry);
      }
    }
  }
  let counts = monkeys.map(m => m.inspections);
  counts.sort((a, b) => b - a);
  console.log(counts);
  console.log(counts[0] * counts[1]);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
