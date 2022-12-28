
import fs from 'fs';

const parseMap = {
  '=': -2,
  '-': -1,
  0: 0,
  1: 1,
  2: 2,
};

const printMap = {
  '-2': '=',
  '-1': '-',
  0: 0,
  1: 1,
  2: 2,
};

function parse(s) {
  return s.split('')
      .map((c, i) => parseMap[c] * Math.pow(5, s.length - 1 - i))
      .reduce((a, b) => a + b);
}

function print(n) {
  let remainder = n;
  let result = '';
  while (remainder > 0) {
    let digit = remainder % 5;
    if (digit > 2) digit -= 5;
    result = printMap[digit] + result;
    remainder = (remainder - digit) / 5;
  }
  return result;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(parse);
  const sum = input.reduce((a, b) => a + b);
  console.log(print(sum));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
