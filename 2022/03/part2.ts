
import fs from 'fs';

function priority(char): number {
  if ('a' <= char && char <= 'z') {
    return char.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  } else if ('A' <= char && char <= 'Z') {
    return char.charCodeAt(0) - 'A'.charCodeAt(0) + 27;
  }
  throw new Error(`Unexpected input: ${char}`);
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input: string[] = rawInput.split('\n');
  let priorities: number[] = [];
  for (let i = 0; i < input.length; i += 3) {
    const firstSet: Set = new Set(input[i]);
    const secondSet: Set = new Set(input[i+1]);
    const third: string = input[i+2];
    const inAll: string = third.split('').find(c => firstSet.has(c) && secondSet.has(c));
    console.log(`${inAll} in group ${i/3}`);
    priorities.push(priority(inAll));
  }
  console.log(priorities.reduce((a, b) => a + b, 0));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
