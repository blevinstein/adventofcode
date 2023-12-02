
import fs from 'fs';

async function main() {
  const lines = fs.readFileSync(process.argv[2]).toString().trim().split('\n');
  const digitRegex = /(\d|one|two|three|four|five|six|seven|eight|nine)/;
  const digitMap = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };
  console.log(lines.map(line => {
        const testFunc = (_, i) => {
          const match = line.slice(i).match(digitRegex)
          return match && match.index === 0;
        };
        const indices = [
          Array.from(line).findIndex(testFunc),
          Array.from(line).findLastIndex(testFunc),
        ];
        const digits = indices.map(i => line.slice(i).match(digitRegex)[0]);
        const values = digits.map(digit => {
          if (digit in digitMap) {
            return digitMap[digit];
          } else {
            return Number(digit);
          }
        });
        const result = Number(`${values[0]}${values[values.length - 1]}`);
        //console.log({ line, digits, result});
        return result;
      }).reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
