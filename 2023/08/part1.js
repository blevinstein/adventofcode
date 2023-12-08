
import fs from 'fs';

async function main() {
  const [ steps, rawTree ] = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n');
  const tree = Object.fromEntries(rawTree.split('\n').map(line => {
    const parts = line.match(/(\w+) = \((\w+), (\w+)\)/).slice(1, 4)
    return [parts[0], parts.slice(1)];
  }));

  let current = 'AAA';
  let step = 0;
  while (current !== 'ZZZ') {
    //console.log(tree[current]);
    const nextStep = steps[step % steps.length];
    //console.log(nextStep);
    current = tree[current][nextStep === 'L' ? 0 : 1];
    //console.log({step, current});
    step++;
  }
  console.log(step);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
