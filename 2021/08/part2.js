
const fs = require('fs');

function intersect(a, b) {
  return new Set(Array.from(a).filter(x => b.has(x)));
}

function eq(string, set) {
  return string.length == set.size && !Array.from(string).find(x => !set.has(x));
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  let total = 0;
  for (let line of rawInput) {
    const parts = line.split(' | ');
    const segments = parts[0].split(' ').map(s => new Set(s));
    const rawOutput = parts[1].split(' ');

    const map = new Map;
    map.set(1, segments.find(s => s.size == 2));
    map.set(4, segments.find(s => s.size == 4));
    map.set(7, segments.find(s => s.size == 3));
    map.set(8, segments.find(s => s.size == 7));

    map.set(2, segments.find(s => s.size == 5 && intersect(s, map.get(4)).size == 2));
    map.set(3, segments.find(s => s.size == 5 && intersect(s, map.get(1)).size == 2));
    map.set(5, segments.find(s => s.size == 5 && intersect(s, map.get(7)).size == 2 && intersect(s, map.get(4)).size == 3));

    map.set(6, segments.find(s => s.size == 6 && intersect(s, map.get(1)).size == 1));
    map.set(9, segments.find(s => s.size == 6 && intersect(s, map.get(4)).size == 4));
    map.set(0, segments.find(s => s.size == 6 && intersect(s, map.get(1)).size == 2 && intersect(s, map.get(4)).size == 3));
    const entries = Array.from(map.entries());

    const output = rawOutput.map(s => entries.find(entry => {
      const [num, set] = entry;
      //console.log(`num=${num} set=${Array.from(set)} searching for ${s}`);
      return eq(s, set);
    })[0]);
    total += output[0] * 1000 + output[1] * 100 + output[2] * 10 + output[3];
  }
  console.log(total);
}

main();
