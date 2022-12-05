
import fs from 'fs';

function* range(n, start = 0, step = 1): Iterator<number> {
  for (let i = start; i < n + start; i += step) yield i;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString();
  const [cratesInput, movesInput] = rawInput.split('\n\n');
  const cratesLines = cratesInput.split('\n');
  const maxItems = cratesLines.length - 1;
  const labelLine = cratesLines[maxItems];
  const numStacks = (cratesLines[0].length + 1)/4;
  const cratesGrid = cratesLines.map(line =>
      Array.from(range(numStacks)).map(i => line[i * 4 + 1]));
  //console.log(cratesGrid);
  const labels =
    Array.from(range(numStacks)).map(i => labelLine[i * 4 + 1]);
  let stacks = new Map(labels.map(label => [label, []]));
  for (let row = maxItems - 1; row >= 0; row--) {
    for (let stack = 0; stack < numStacks; stack++) {
      if (cratesGrid[row][stack] != ' ') {
        const label = labelLine[stack * 4 + 1];
        stacks.get(label).push(cratesGrid[row][stack]);
      }
    }
  }
  //console.log(stacks);
  for (const line of movesInput.trim().split('\n')) {
    //console.log(line);
    const [_, numString, source, dest] = line.match(/move (\d+) from (\d+) to (\d+)/);
    const num = Number(numString);
    const sourceStack = stacks.get(source);
    const destStack = stacks.get(dest);
    const moved = sourceStack.slice(sourceStack.length - num);
    stacks.set(source, sourceStack.slice(0, sourceStack.length - num));
    stacks.set(dest, destStack.concat(moved));
    //console.log(stacks);
  }
  console.log(
      Array.from(range(numStacks)).map(i => stacks.get(labelLine[i * 4 + 1]).pop()).join(''));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
