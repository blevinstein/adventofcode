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
  const breakpoints = [20, 60, 100, 140, 180, 220];
  const results = [];
  let cycle = 1;
  let register = 1;
  for (let instruction of instructions) {
    for (let t = 0; t < instruction.time; ++t) {
      if (breakpoints.includes(cycle)) {
        results.push(register * cycle);
      }
      cycle++;
    }
    register += instruction.value;
  }
  console.log(results);
  console.log(results.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
