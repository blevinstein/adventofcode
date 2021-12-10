
const fs = require('fs');

const CLOSE_MAP = new Map([
    ['(', ')'],
    ['{', '}'],
    ['<', '>'],
    ['[', ']']]);

const SCORE_MAP = new Map([
    [')', 1],
    [']', 2],
    ['}', 3],
    ['>', 4]]);

async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  let scores = [];
  for (let line of input) {
    let stack = [];
    let valid = true;
    for (let character of line) {
      if ('([<{'.includes(character)) {
        stack.push(character);
      } else {
        const open = stack.pop();
        if (CLOSE_MAP.get(open) != character) {
          valid = false;
          break;
        }
      }
    }
    if (valid && stack.length > 0) {
      let score = 0;
      while (stack.length > 0) {
        score = score * 5 + SCORE_MAP.get(CLOSE_MAP.get(stack.pop()));
      }
      scores.push(score);
    }
  }

  scores.sort((a, b) => a > b ? 1 : -1);
  console.log(`Scores=${scores}\nMiddle score=${scores[Math.floor(scores.length / 2)]}`);
}

main();
