
const fs = require('fs');

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();

  console.log(rawInput);

  const input = rawInput.split('\n')
      .filter(line => line.length > 0)
      .map(line => line.split('').map(v => v == '1' ? 1 : 0));

  const width = input[0].length;

  console.log(input);

  function mostCommonAt(values, i) {
    let sum = 0;
    for (let j = 0; j < values.length; ++j) {
      sum += values[j][i];
    }
    console.log(`sum=${sum} length=${values.length}`);
    if (sum * 2 >= values.length) {
      return 1;
    } else if (sum * 2 < values.length) {
      return 0;
    }
  }

  function getRating(oxygen) {
    let values = input;
    for (let bit = 0; bit < width; ++bit) {
      const mostCommon = mostCommonAt(values, bit, oxygen ? 1 : 0);
      values = values.filter(row => oxygen ? row[bit] == mostCommon : row[bit] != mostCommon);
      console.log(`mostCommon=${mostCommon} values=${values.length}`);
      if (values.length == 1) {
        return parseInt(values[0].join(''), 2);
      } else if (values.length == 0) {
        throw Error('No values left');
      }
    }
  }

  const oxygenRating = getRating(true);
  const scrubberRating = getRating(false);

  console.log(`oxygen=${oxygenRating} scrubber=${scrubberRating}`);
  console.log(`product=${oxygenRating * scrubberRating}`);
}

main();
