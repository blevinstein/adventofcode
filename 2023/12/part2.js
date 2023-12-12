
import fs from 'fs';

function eq(a, b) {
  return a.length === b.length && a.every((elem, i) => elem === b[i]);
}

const possibleStringsCache = {};
function possibleStrings(pattern, counts) {
  if (counts.some(c => isNaN(c))) {
    throw Error('Bad input');
  }

  const cacheKey = [pattern, counts.join(',')].join('/');
  if (cacheKey in possibleStringsCache) {
    //console.log({ pattern, counts, result: possibleStringsCache[cacheKey] });
    return possibleStringsCache[cacheKey];
  }

  const qIndex = pattern.indexOf('?');
  let result;
  if (qIndex >= 0) {
    const prefix = pattern.slice(0, qIndex);
    const suffix = pattern.slice(qIndex + 1);
    const prefixParts = countParts(prefix);
    //console.log({ pattern: prefix + '*' + suffix, counts, prefixParts });
    if (prefixParts.length > counts.length
        // Prefix counts don't match
        || prefixParts.slice(0, prefixParts.length - 1).some((count, i) => counts[i] !== count)
        || prefixParts[prefixParts.length - 1] > counts[prefixParts.length - 1]
        // We have insufficient remaining space to construct all the counts
        || counts.length - prefixParts.length > (suffix.length + 2) / 2
        // We have too many disconnected parts remaining to be accounted for
        || counts.length - prefixParts.length + 1 < suffix.split(/\.+/).filter(s => !!s)) {

          /*
      console.log([
        prefixParts.length > counts.length,
        prefixParts.slice(0, prefixParts.length - 1).some((count, i) => counts[i] !== count),
        prefixParts[prefixParts.length - 1] > counts[prefixParts.length - 1],
        counts.length - prefixParts.length > (suffix.length + 1) / 2,
        counts.length - prefixParts.length + 1 < suffix.split(/\.+/).filter(s => !!s),
        'SHORT-CIRCUIT'
      ]);
      */

      // Short-circuit, counts do not match the pattern
      //console.log({prefix, prefixParts, suffix, counts, shortCircuit: true});
      result = 0;
    } else if (prefixParts[prefixParts.length - 1] < counts[prefixParts.length - 1]) {
      // We must make this part longer to match the counts
      result = possibleStrings(prefix + '#' + suffix, counts);
    } else if (prefixParts[prefixParts.length - 1] === counts[prefixParts.length - 1]
        && prefix[prefix.length - 1] === '#') {
      if (prefixParts.length === counts.length) {
        // We have exhausted our parts, finish now
        if (Array.from(suffix).some(c => c === '#')) {
          // We have unmatched parts
          //console.log({ /*prefix, prefixParts, suffix, counts,*/ incomplete: true });
          result = 0;
        } else {
          // Remaining characters can all be empty
          //console.log({ /*prefix, prefixParts, suffix, counts,*/ done: true });
          result = 1;
        }
      } else {
        // We must terminate this part because we have the right length
        result = possibleStrings(prefix + '.' + suffix, counts);
      }
    } else {
      // We have satisfied a prefix of the counts, and the last character was empty.
      // Recurse on the suffix ONLY. This allows for memoization.
      //console.log([qIndex, prefix, suffix, prefixParts.join(',')].join('\t\t'));
      const suffixParts = counts.slice(prefixParts.length);
      //console.log({ /*prefix, suffix, counts, prefixParts, suffixParts,*/ recurse: true });
      result = possibleStrings('#' + suffix, suffixParts)
          + possibleStrings('.' + suffix, suffixParts);
    }
  } else {
    //console.log({ pattern, counts, matches: eq(countParts(pattern), counts) });
    if (eq(countParts(pattern), counts)) {
      result = 1;
    } else {
      result = 0;
    }
  }
  possibleStringsCache[cacheKey] = result;
  return result;
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
  const possibilities = fullInput
      .map(i => {
        console.log(i.join('\t\t'));
        return possibleStrings(...i);
      });
  console.log(possibilities);
  console.log(possibilities.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
