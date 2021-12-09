
const fs = require('fs');

function intersect(a, b) {
  return new Set(Array.from(a).filter(x => b.has(x)));
}

function eq(a, b) {
  for (let x of a) if (!b.has(x)) return false;
  for (let x of b) if (!a.has(x)) return false;
  return true;
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  let count = 0;
  for (let line of rawInput) {
    const parts = line.split(' | ');
    const segments = parts[0].split(' ').map(s => new Set(s));
    const output = parts[1].split(' ');

    count += output
        .filter(entry => entry.length == 2 || entry.length == 4 || entry.length == 3 || entry.length == 7)
        .length;
  }
  console.log(count);
}

main();
