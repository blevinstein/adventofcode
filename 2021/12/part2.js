
const fs = require('fs');

function isSmall(node) {
  return node[0] == node[0].toLowerCase();
}

async function main() {
  const graph = new Map;
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(row => row.split('-'));
  for (let [a, b] of input) {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  }

  const paths = [['start']];
  const donePaths = [];
  while (paths.length > 0) {
    const currentPath = paths.pop();
    const currentNode = currentPath[currentPath.length - 1];
    if (currentNode == 'end') {
      donePaths.push(currentPath);
    } else {
      const smallCaves = new Set;
      let hasDouble = false;
      for (let node of currentPath) {
        if (smallCaves.has(node)) {
          hasDouble = true;
        } else if (isSmall(node)) {
          smallCaves.add(node);
        }
      }
      for (let nextCave of graph
          .get(currentNode)
          .filter(node => hasDouble ? !smallCaves.has(node) : node != 'start')) {
        paths.push(currentPath.concat([nextCave]));
      }
    }
  }
  for (let donePath of donePaths) {
    console.log(donePath.join(','));
  }
  console.log(`Num paths=${donePaths.length}`);
}

main();
