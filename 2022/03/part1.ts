
import fs from 'fs';

function priority(char) {
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
  const priorities = input.map(sack => {
    const half = sack.length / 2;
    const first = sack.substring(0, half);
    const second = sack.substring(half);
    const firstSet = new Set(first);
    const inBoth = second.split('').find(c => firstSet.has(c));
    console.log(`${inBoth} in ${first} and ${second}`);
    return priority(inBoth);
  });
  console.log(priorities.reduce((a, b) => a + b, 0));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
