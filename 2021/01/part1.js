
const fs = require('fs');

(async () => {
  const rawInput = fs.readFileSync(process.argv[2]).toString();
  const input = rawInput.split('\n')
      .filter(line => line.length > 0)
      .map(line => parseInt(line));

  let count = 0;
  for (let i = 0; i < input.length - 1; ++i) {
    if (input[i+1] > input[i]) {
      count++;
    }
  }
  console.log(count);
})();
