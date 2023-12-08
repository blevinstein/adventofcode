
import fs from 'fs';

function gcd(a, b) {
  if (a === 0) return b;
  if (b === 0) return a;
  const max = Math.max(a, b);
  const min = Math.min(a, b);
  const r = max % min;
  return gcd(min, r);
}

async function main() {
  const [ steps, rawTree ] = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n');
  const tree = Object.fromEntries(rawTree.split('\n').map(line => {
    const parts = line.match(/(\w+) = \((\w+), (\w+)\)/).slice(1, 4)
    return [parts[0], parts.slice(1)];
  }));

  let current = Object.keys(tree).filter(node => node.endsWith('A'));
  let step = 0;
  let memory = {};
  let cycles = {};
  let doneSteps = {};
  while (Object.keys(cycles).length < current.length) {

    // Detect cycles
    for (let index = 0; index < current.length; ++index) {
      if (index in cycles) continue;
      if (current[index].endsWith('Z')) {
        const key = [index, current[index], step % steps.length].join(',');
        if (key in memory) {
          console.log(`Found cycle! Index ${index} Current ${current[index]} Step = ${step} Length = ${step - memory[key]}`);
          cycles[index] = step - memory[key];
        } else {
          console.log(`Found done step! Index ${index} Step ${step}`);
          doneSteps[index] = (doneSteps[index] || []).concat(step);
          memory[key] = step;
        }
      }
    }

    const nextStep = steps[step % steps.length];
    current = current.map(c => tree[c][nextStep === 'L' ? 0 : 1]);
    step++;
  }
  const commonFactor = Object.values(cycles).reduce(gcd, 0);
  console.log(Object.values(cycles).map(c => c / commonFactor).reduce((a, b) => a * b) * commonFactor);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
