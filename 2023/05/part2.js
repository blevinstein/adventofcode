
import fs from 'fs';

function rangeArray(start, endExclusive) {
  return Array.from(function*(start, endExclusive) {
    for (let i = start; i < endExclusive; ++i) yield i;
  }(start, endExclusive));
}

function applyMapPartToRange([rangeStart, rangeLength], [destStart, sourceStart, sourceLength]) {

  const rangeEnd = rangeStart + rangeLength;
  const sourceEnd = sourceStart + sourceLength;

  if (rangeEnd > sourceStart && rangeStart < sourceEnd) {
    if (rangeStart >= sourceStart) {
      if (rangeEnd <= sourceEnd) {
        // r is a subset of m
        return {
          result: [rangeStart + destStart - sourceStart, rangeLength],
        };
      } else {
        // remainder of r is greater than m
        return {
          result: [rangeStart + destStart - sourceStart, sourceEnd - rangeStart],
          remainder: [[sourceEnd, rangeEnd - sourceEnd]],
        };
      }
    } else {
      if (rangeEnd <= sourceEnd) {
        // remainder of r is less than m
        return {
          result: [destStart, rangeEnd - sourceStart],
          remainder: [[rangeStart, sourceStart - rangeStart]],
        };
      } else {
        // remainder of r on both sides of m
        return {
          result: [destStart, sourceLength],
          remainder: [
            [rangeStart, sourceStart - rangeStart],
            [sourceEnd, rangeEnd - sourceEnd],
          ],
        };
      }
    }
  } else {
    // No overlap
    return { remainder: [[rangeStart, rangeLength]] };
  }
}

function applyMapToRange(inputRange, map) {
  let input = [inputRange];
  let output = [];
  for (let part of map) {
    input = input.flatMap((range) => {
      //console.log({ range, part });
      const { result, remainder } = applyMapPartToRange(range, part);
      //console.log({ result, remainder });
      if (result) output.push(result);
      return remainder || [];
    });
  }
  //console.log(`Remainder: ${JSON.stringify(input)}`);
  return output.concat(input);
}

function applyMapsToRange(inputRange, maps) {
  let ranges = [inputRange];
  for (let map of maps) {
    ranges = ranges.flatMap(r => applyMapToRange(r, map));
  }
  return ranges;
}

async function main() {
  const parts = fs.readFileSync(process.argv[2]).toString().trim().split('\n\n');
  const seedNumbers = parts[0].split(': ')[1].split(' ').map(s => Number(s));
  const ranges = rangeArray(0, seedNumbers.length/2).map(i => [seedNumbers[i*2], seedNumbers[i*2+1]]);
  const maps = parts.slice(1).map(part => part.split('\n').slice(1).map(line => line.split(' ').map(s => Number(s))));

  const results = ranges.flatMap(r => applyMapsToRange(r, maps)).sort((a, b) => a[0] - b[0]);
  console.log(JSON.stringify(results));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
