
const fs = require('fs');


async function main() {
  const input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(row => Array.from(row).map(s => parseInt(s)));

  let total = 0;
  for (let i = 0; i < input.length; ++i) {
    for (let j = 0; j < input[i].length; ++j) {
      if ((i == 0 || input[i][j] < input[i-1][j]) &&
          (j == 0 || input[i][j] < input[i][j-1]) &&
          (i == input.length - 1 || input[i][j] < input [i+1][j]) &&
          (j == input[i].length - 1 || input[i][j] < input[i][j+1])) {
        const risk = 1 + input[i][j];
        console.log(`risk=${risk}`);
        total += risk;
      }
    }
  }
  console.log(`total=${total}`);
}

main();
