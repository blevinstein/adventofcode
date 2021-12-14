
const fs = require('fs');

const DEBUG = false;

async function main() {
  let [template, replacementInput] = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n\n');

  const replacements = new Map(replacementInput.split('\n').map(line => {
    const r = /(\w*) -> (\w)/.exec(line);
    return [r[1], r[2]];
  }));

  for (let step = 0; step < 10; ++step) {
    for (let i = 0; i < template.length - 1; ++i) {
      const r = replacements.get(template.slice(i, i+2));
      if (r) {
        template = template.slice(0, i+1) + r + template.slice(i+1);
        ++i;
      }
    }
    if (DEBUG) console.log(template);
  }

  const counts = new Map;
  for (let i = 0; i < template.length; ++i) {
    counts.set(template[i], (counts.get(template[i]) || 0) + 1);
  }
  console.log(counts);
}

main();
