
const fs = require('fs');

function parseCoord(string) {
  const [x,y] = string.split(',');
  return [x,y].map(s => parseInt(s));
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();

  const input = rawInput.trim().split('\n').map(line => {
    let [from, sep, to] = line.split(' ');
    from = parseCoord(from);
    to = parseCoord(to);
    let covers;
    if (from[0] == to[0] || from[1] == to[1]) {
      covers = (point) => {
        return (point[0] >= from[0] || point[0] >= to[0]) &&
            (point[0] <= from[0] || point[0] <= to[0]) &&
            (point[1] >= from[1] || point[1] >= to[1]) &&
            (point[1] <= from[1] || point[1] <= to[1]);
      }
    } else {
      const lineOffset = [to[0] - from[0], to[1] - from[1]];
      if (Math.abs(lineOffset[0]) != Math.abs(lineOffset[1]))
          throw Error(`Not diagonal line: ${line}`);
      const lineLength = Math.abs(lineOffset[0]);
      covers = (point) => {
        const offset = [point[0] - from[0], point[1] - from[1]];
        return Math.abs(offset[0]) == Math.abs(offset[1]) &&
            Math.abs(offset[0]) <= lineLength &&
            offset[0] * lineOffset[0] >= 0 &&
            offset[1] * lineOffset[1] >= 0;
      };
    }
    if (sep != '->') throw Error(`Unexpected input: ${line}`);
    return {
      from,
      to,
      covers
    };
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
      const count = input.filter(line => line.covers([x, y])).length;
      if (count >= 2) bigCount++;
      if (print) process.stdout.write(count > 0 ? count.toString() : '.');
    }
    if (print) process.stdout.write('\n');
  }

  console.log(`count=${bigCount}`);
}

main();
