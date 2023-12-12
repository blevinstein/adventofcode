
import fs from 'fs';

function eq(a, b) {
  return a.length === b.length && a.every((elem, i) => elem === b[i]);
}

function possibleStrings(pattern) {
  const qIndex = pattern.indexOf('?');
  if (qIndex >= 0) {
    const possibleEndings = possibleStrings(pattern.slice(qIndex + 1));
    return possibleEndings.flatMap(e => [pattern.slice(0, qIndex) + '.' + e, pattern.slice(0, qIndex) + '#' + e]);
  } else {
    return [pattern];
  }
}

function countBits(s) {
  return s.split(/\.+/).map(s => s.length).filter(n => n !== 0);
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line => {
    let [ pattern, countsRaw ] = line.split(' ');
    let counts = countsRaw.split(',').map(s => Number(s));
    return [ pattern, counts ];
  });
  console.log(input);
  const arrangements = input
      .map(([pattern, counts]) => {
          const possibilities = possibleStrings(pattern);
          //console.log({ pattern, counts, possibilities: possibilities.map(countBits) });
          return possibilities.filter(s => eq(countBits(s), counts)).length;
      });
  console.log(arrangements);
  console.log(arrangements.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
