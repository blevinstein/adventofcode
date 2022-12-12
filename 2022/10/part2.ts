"use strict";

import fs from 'fs';

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const instructions: { time: number, value: number }[] = rawInput.split('\n').map(line => {
    if (line == 'noop') {
      return { time: 1, value: 0 };
    } else {
      return { time: 2, value: Number(line.split(' ')[1]) };
    }
  });
  let cycle = 1;
  let register = 1;
  let result = '';
  for (let instruction of instructions) {
    for (let t = 0; t < instruction.time; ++t) {
      const head = (cycle - 1) % 40;
      result += Math.abs(head - register) <= 1 ? '#' : '.';
      if (head == 39) {
        result += '\n';
      }
      cycle++;
    }
    register += instruction.value;
  }
  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
