
import fs from 'fs';
//import { Queue } from '@datastructures-js/queue';
//import { MinPriorityQueue } from '@datastructures-js/priority-queue';

import { range } from '../../common.js';

function checkSolution(graph, removedConnections) {
  const queue = [removedConnections[0][0]];
  const result = new Set;

  while (queue.length > 0) {
    const node = queue.pop();
    if (result.has(node)) continue;
    result.add(node);

    // Stop immediately if a removedConnection is included in the floodfill
    if (removedConnections.some(r => result.has(r[0]) && result.has(r[1]))) return false;

    for (let neighbor of graph[node]) {
      // Omit removed connections
      if (removedConnections.some(r => (node === r[0] && neighbor === r[1])
          || (node === r[1] && neighbor === r[0]))) continue;
      queue.push(neighbor);
    }
  }
  return result.size;
  //return Array.from(result);
}

function findPath(graph, start, finish) {
  const visited = new Set;
  const queue = [[start]];
  while (queue.length > 0) {
    const path = queue.pop();
    const last = path[path.length - 1];
    if (visited.has(last)) continue;
    visited.add(last);
    if (last === finish) return path;
    for (let next of graph[last].sort((a, b) => Math.random() - 0.5)) {
      queue.push(path.concat([next]));
    }
  }
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/:?\s+/));

  // Build bi-directional graph
  const graph = {};
  for (let instruction of input) {
    const a = instruction[0];
    for (let b of instruction.slice(1)) {
      graph[a] = (graph[a] || []).concat([b]);
      graph[b] = (graph[b] || []).concat([a]);
    }
  }
  console.log(`${Object.keys(graph).length} nodes`);
  //console.log(Array.from(Object.values(graph)).map(n => n.length).join('/'));

  const allNodes = Object.keys(graph);

  const numGraph = Object.fromEntries(Object.entries(graph).map(([node, neighborList]) =>
      [allNodes.indexOf(node), neighborList.map(neighbor => allNodes.indexOf(neighbor))]));

  /*
  const crystals = [];
  const visitedCrystal = new Set;
  for (let i of range(allNodes.length)) {
    for (let j of range(i+1, allNodes.length)) {
      let crystal = [allNodes[i], allNodes[j]];
      if (crystal.some(c => visitedCrystal.has(c))) continue;

      let addNodes = crystal.map(c => graph[c].filter(d => !crystal.includes(d)))
            .reduce((a, b) => a.filter(el => b.includes(el)));
      crystal = crystal.concat(addNodes);

      if (crystal.length >= 4) {
        crystals.push(crystal);
        crystal.forEach(c => visitedCrystal.add(c));
      }
    }
  }
  console.log(crystals.map(c => c.join('/')));
  */

  // Find triangles. These seem like they would not be part of any solution
  /*
  const triangles = [];
  for (let a of Object.keys(graph)) {
    for (let b of graph[a]) {
      for (let c of graph[b]) {
        if (graph[a].includes(c)) {
          triangles.push([ a, b, c ]);
        }
      }
    }
  }
  console.log(`Found ${triangles.length} triangles`);
  */

  // Create a flat list of connections we can remove
  const connections = [];
  for (let a of range(allNodes.length)) {
    for (let b of range(a+1, allNodes.length)) {
      if (!numGraph[a].includes(b)) continue; // Not connected
      //if (triangles.some(t => t.includes(a) && t.includes(b))) continue; // Not part of the solution?
      //if (crystals.some(c => c.includes(a) && c.includes(b))) continue; // Not part of the solution?
      connections.push([a, b]);
    }
  }

  // Sort by occurrences in random paths. Clever idea stolen from somebody on the reddit thread.
  const count = {};
  for (let i of range(1000)) {
    const start = Math.floor(Math.random() * allNodes.length);
    const finish = Math.floor(Math.random() * allNodes.length);
    const path = findPath(numGraph, start, finish);
    for (let j of range(path.length - 1)) {
      const connectionKey = [path[j], path[j+1]].sort().toString();
      count[connectionKey] = (count[connectionKey] || 0) + 1;
    }
  }
  connections.sort((a, b) => (count[b.toString()] || 0) - (count[a.toString()] || 0));

  console.log(`${connections.length} connections`);
  //connections.slice(0, 20).forEach(c => console.log(`Connection ${c} -> Count ${count[c.toString()] || 0}`));

  /*
  function getBorder(graph, fill) {
    return fill.flatMap((f) => graph[f].filter((g) => !fill.includes(g)).map(g => [f, g]));
  }
  */

  /*
  let counter = 0;
  // Searches over the possible state of floodfill boundaries.
  function floodfillSearch(graph) {
    const visited = new Set;
    const allNodes = Object.keys(graph);
    //const queue = new MinPriorityQueue(node => node.borderSize);
    const queue = new Queue;
    const initFill = [allNodes[0]];
    queue.enqueue({ fill: initFill, borderSize: getBorder(graph, initFill).length });
    while (queue.size() > 0) {
      // Fill is some subset of the graph nodes
      const { fill, borderSize } = queue.dequeue();

      // Avoid redundant processing
      const cacheKey = fill.sort().toString();
      if (visited.has(cacheKey)) continue;
      visited.add(cacheKey);

      // Sample output
      if (++counter % 1e2 === 0) console.log({ counter, queueSize: queue.size(), depth: fill.length, cacheSize: visited.size, peek: queue.front() });

      // Check for a solution
      if (borderSize === 3) {
        return getBorder(graph, fill);
      }

      // Else, add to the search space
      for (let newNode of allNodes.filter(g => !fill.includes(g))) {
        const newNodes = [newNode];
        const newFill = fill.concat(newNode).sort();
        const borderSize = getBorder(graph, newFill).length;
        queue.enqueue({ fill: newFill, borderSize });
      }
    }
  }
  console.log(floodfillSearch(graph));
  */

  let counter = 0;
  for (let i = 0; i < connections.length; ++i) {
    for (let j = i+1; j < connections.length; ++j) {
      for (let k = j+1; k < connections.length; ++k) {
        const removedConnections = [connections[i], connections[j], connections[k]];

        if (++counter % 1e4 === 0) {
          console.log({ i, j, k });
        }

        let result = checkSolution(numGraph, removedConnections);
        if (result) {
          console.log(`Solved! ${removedConnections.map(([a, b]) => `${allNodes[a]}/${allNodes[b]}`)}`);
          console.log(result * (allNodes.length - result));
          //console.log(`Solved! ${removedConnections.map(r => r.join('/'))}`);
          return;
        }
      }
    }
  }
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
