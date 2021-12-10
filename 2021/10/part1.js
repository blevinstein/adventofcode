
const fs = require('fs');

const CLOSE_MAP = new Map([
    ['(', ')'],
    ['{', '}'],
    ['<', '>'],
    ['[', ']']]);

const SCORE_MAP = new Map([
    [')', 3],
    [']', 57],
    ['}', 1197],
    ['>', 25137]]);

async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  let score = 0;
  for (let line of input) {
    let stack = [];
    for (let character of line) {
      if ('([<{'.includes(character)) {
        stack.push(character);
      } else {
        const open = stack.pop();
        if (CLOSE_MAP.get(open) != character) {
          score += SCORE_MAP.get(character);
          break;
        }
      }
    }
  }

  console.log(`Score=${score}`);
}

main();
