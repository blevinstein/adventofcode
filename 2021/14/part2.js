
const fs = require('fs');

const DEBUG = true;

async function main() {
  let [template, replacementInput] = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n\n');

  const replacements = new Map(replacementInput.split('\n').map(line => {
    const r = /(\w*) -> (\w)/.exec(line);
    return [r[1], r[2]];
  }));

  let pairCounts = new Map;
  for (let i = 0; i < template.length - 1; ++i) {
    const pair = template.slice(i, i+2);
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
  }

  for (let step = 0; step < 40; ++step) {
    const newPairCounts = new Map;
    for (let [pair, count] of pairCounts.entries()) {
      if (replacements.has(pair)) {
        const newPairA = pair[0] + replacements.get(pair);
        const newPairB = replacements.get(pair) + pair[1];
        newPairCounts.set(newPairA, (newPairCounts.get(newPairA) || 0) + count);
        newPairCounts.set(newPairB, (newPairCounts.get(newPairB) || 0) + count);
      } else {
        newPairCounts.set(pair, (newPairCounts.get(pair) || 0) + count);
      }
    }
    pairCounts = newPairCounts;
  }

  let charCounts = new Map;
  // Add first character of template
  charCounts.set(template[0], 1);
  // Every other character is the second half of a pair
  for (let [pair, count] of pairCounts.entries()) {
    charCounts.set(pair[1], (charCounts.get(pair[1]) || 0) + count);
  }

  console.log(charCounts);
}

main();
