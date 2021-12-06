
const fs = require('fs');

function parseCoord(string) {
  const [x,y] = string.split(',');
  return [x,y].map(s => parseInt(s));
}

function covers(line, point) {
  const terms = [
      // Line is horizontal or vertical
      (line.from[0] == line.to[0] || line.from[1] == line.to[1]),
      // Line covers the point
      (point[0] >= line.from[0] || point[0] >= line.to[0]),
      (point[0] <= line.from[0] || point[0] <= line.to[0]),
      (point[1] >= line.from[1] || point[1] >= line.to[1]),
      (point[1] <= line.from[1] || point[1] <= line.to[1]),
  ];
  return terms.reduce((a, b) => a && b);
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();

  const input = rawInput.trim().split('\n').map(line => {
    const [from, sep, to] = line.split(' ');
    if (sep != '->') throw Error(`Unexpected input: ${line}`);
    return {from: parseCoord(from), to: parseCoord(to)};
  });

  const xs = input
      .flatMap(line => [line.from, line.to])
      .map(coord => coord[0]);
  const ys = input
      .flatMap(line => [line.from, line.to])
      .map(coord => coord[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  console.log(`x=${minX},${maxX} y=${minY},${maxY}`);

  const print = false;
  let bigCount = 0;
  for (let y = minY; y <= maxY; ++y) {
    for (let x = minX; x <= maxX; ++x) {
      const count = input.filter(line => covers(line, [x, y])).length;
      if (count >= 2) bigCount++;
      if (print) process.stdout.write(count > 0 ? count.toString() : '.');
    }
    if (print) process.stdout.write('\n');
  }

  console.log(`count=${bigCount}`);
}

main();
