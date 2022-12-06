
import fs from 'fs';

function* range(n, start = 0, step = 1): Iterator<number> {
  for (let i = 0; i < n; i ++) {
    yield (i * step + start);
  }
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const windowSize = 14;
  const result = Array.from(range(rawInput.length)).map(i => {
    const window = rawInput.slice(i < windowSize ? 0 : i - windowSize, i)
    return [i, new Set(window).size];
  }).find((args) => {
    const [i, count] = args;
    return count == windowSize;
  });
  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
