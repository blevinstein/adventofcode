
import fs from 'fs';

function eq(a, b) {
  return a.length === b.length && a.every((elem, i) => elem === b[i]);
}

function possibleStrings(pattern, counts) {
  if (counts.some(c => isNaN(c))) {
    throw Error('Bad input');
  }
  const qIndex = pattern.indexOf('?');
  if (qIndex >= 0) {
    const prefix = pattern.slice(0, qIndex);
    const suffix = pattern.slice(qIndex + 1);
    const prefixParts = countParts(prefix);
    if (prefixParts.length > counts.length
        || prefixParts.slice(0, prefixParts.length - 1).some((count, i) => counts[i] !== count)
        || prefixParts[prefixParts.length - 1] > counts[prefixParts.length - 1]
        || counts.length - prefixParts.length > (suffix.length + 2) / 2
        || counts.length - prefixParts.length + 1 < suffix.split(/\.+/).filter(s => !!s)) {

      /*
      console.log([
        refixParts.length > counts.length,
        prefixParts.slice(0, prefixParts.length - 1).some((count, i) => counts[i] !== count),
        prefixParts[prefixParts.length - 1] > counts[prefixParts.length - 1],
        counts.length - prefixParts.length > (suffix.length + 1) / 2,
        counts.length - prefixParts.length + 1 < suffix.split(/\.+/).filter(s => !!s)
      ]);
      */

      // Short-circuit, counts do not match the pattern
      //console.log({prefix, prefixParts, suffix, counts, shortCircuit: true});
      return [];
    } else if (prefixParts[prefixParts.length - 1] < counts[prefixParts.length - 1]) {
      return possibleStrings(prefix + '#' + suffix, counts);
    } else if (prefixParts[prefixParts.length - 1] === counts[prefixParts.length - 1]
        && prefix[prefix.length - 1] === '#') {
      if (prefixParts.length === counts.length) {
        // We have exhausted our parts, finish now
        if (Array.from(suffix).some(c => c === '#')) {
          // We have unmatched # parts
          //console.log({ prefix, prefixParts, suffix, counts, incomplete: true });
          return [];
        } else {
          // Remaining characters can all be .
          console.log({ prefix, prefixParts, suffix, counts, done: true });
          return [prefix + '.' + Array.from(suffix).map(c => c === '?' ? '.' : c).join('')];
        }
      } else {
        // Add a . to separate the last part
        return possibleStrings(prefix + '.' + suffix, counts);
      }
    } else {
      return possibleStrings(prefix + '#' + suffix, counts).concat(
          possibleStrings(prefix + '.' + suffix, counts));
    }
  } else {
    if (eq(countParts(pattern), counts)) {
      return [pattern];
    } else {
      return [];
    }
  }
}

function countParts(s) {
  return s.split(/\.+/).map(s => s.length).filter(n => n !== 0);
}

function range(n) {
  return Array.from(function*(n) {
    for (let i = 0; i < n; ++i) yield i;
  }(n));
}

async function main() {
  const input = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line => {
    let [ pattern, countsRaw ] = line.split(' ');
    let counts = countsRaw.split(',').map(s => Number(s));
    return [ pattern, counts ];
  });
  const fullInput = input.map(([pattern, counts]) => {
    const fullPattern = range(5).map(_ => pattern).join('?');
    const fullCounts = range(5).flatMap(_ => counts);
    return [fullPattern, fullCounts];
  });
  //const fullInput = input;
  //const fullInput = input.slice(5, 6);
  const possibilities = fullInput.map(i => {
    console.log(i);
    return possibleStrings(...i).length;
  });
  console.log(possibilities);
  console.log(possibilities.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
