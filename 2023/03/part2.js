
import fs from 'fs';

function range(start, endExclusive) {
  return Array.from(function*(start, endExclusive) {
    for (let i = start; i < endExclusive; ++i) yield i;
  }(start, endExclusive));
}

async function main() {
  const lines = fs.readFileSync(process.argv[2]).toString().trim().split('\n');
  const gears = {};
  const partNumbers = lines.flatMap((line, rowIndex) => {
    const matches = Array.from(line.matchAll(/\d+/g));
    return matches.map(match => ({ row: rowIndex, col: match.index, value: match[0] }));
  });
  partNumbers.forEach(({ row, col, value }) => {
    //console.log({ row, col, value });
    for (let rRel of [-1, 1]) {
      for (let cRel of range(-1, value.length + 1)) {
        //console.log({ r: row + rRel, c: col + cRel });
        if (row + rRel < 0 || row + rRel >= lines.length) continue;
        if (col + cRel < 0 || col + cRel >= lines[0].length) continue;
        if (lines[row + rRel][col + cRel] === '*') {
          const key = [row + rRel, col + cRel].toString();
          gears[key] = (gears[key] || []).concat(Number(value));
        }
      }
    }
    for (let cRel of [-1, value.length]) {
      const rRel = 0;
      //console.log({ r: row + rRel, c: col + cRel });
      if (row + rRel < 0 || row + rRel >= lines.length) continue;
      if (col + cRel < 0 || col + cRel >= lines[0].length) continue;
      if (lines[row + rRel][col + cRel] === '*') {
        const key = [row + rRel, col + cRel].toString();
        gears[key] = (gears[key] || []).concat(Number(value));
      }
    }
  });
  console.log(Object.values(gears)
      .filter(gear => gear.length === 2)
      .map(gear => gear.reduce((a, b) => a * b))
      .reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
