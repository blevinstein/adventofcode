
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
      const smallCaves = new Set(currentPath.filter(isSmall));
      for (let nextCave of graph
          .get(currentNode)
          .filter(node => !smallCaves.has(node))) {
        paths.push(currentPath.concat([nextCave]));
      }
    }
  }
  for (let donePath of donePaths) {
    console.log(donePath);
  }
  console.log(`Num paths=${donePaths.length}`);
}

main();
